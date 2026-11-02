// One tool registry shared by the stdio and Cloudflare Worker entries.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  AS_OF, ACCOUNTS, DISCLAIMER, InputError, PAGES, PLANS, SOURCES, moreUrl, planLimits,
  getContributionLimits, calculateMaxContribution, getSocialSecurity, compareYears, requireYear,
} from "./core.js";

export const SERVER_NAME = "retirement-contribution-limits-2027-mcp";
export const SERVER_VERSION = "1.0.0";

const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const year = z.number().int().min(2025).max(2027).describe("Calendar year: 2025, 2026 or 2027.");

type Payload = Record<string, unknown>;
function reply(summary: string, data: Payload, source: string, morePath: string) {
  const body = { ...data, summary, as_of: AS_OF, source, more: moreUrl(morePath), disclaimer: DISCLAIMER };
  return {
    content: [
      { type: "text" as const, text: `${summary}\n\n${DISCLAIMER}` },
      { type: "text" as const, text: JSON.stringify(body, null, 2) },
    ],
    structuredContent: body,
  };
}

function run(fn: () => ReturnType<typeof reply>) {
  try {
    return fn();
  } catch (e) {
    const msg = e instanceof InputError ? e.message : `Unexpected error: ${(e as Error).message}`;
    return { isError: true, content: [{ type: "text" as const, text: msg }] };
  }
}

const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

function planSource(y: number): string {
  const p = planLimits(requireYear(y));
  return p ? p.source : `${SOURCES.irsNews} (checked ${AS_OF}: no 2027 notice yet)`;
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "get_contribution_limits",
    {
      title: "401(k), IRA, HSA and SIMPLE contribution limits (2025-2027)",
      description:
        "Returns official IRS contribution limits for 2025, 2026 and 2027: 401(k)/403(b)/TSP and 457(b) elective deferral ($24,500 for 2026), age 50+ catch-up ($8,000 for 2026), the SECURE 2.0 age 60-63 super catch-up ($11,250), IRA limit and catch-up ($7,500 + $1,100 for 2026), SIMPLE limits, 415(c) total ($72,000), 401(a)(17) compensation limit, highly compensated employee threshold, Roth IRA phase-outs, HSA self/family limits (2027: $4,500 / $9,000, Rev. Proc. 2026-24) and the Social Security wage base (2027: $192,300). Also states the Roth catch-up rule status. Figures copied from IRS Notices 2024-80 and 2025-67 and the HSA Rev. Procs. 2027 plan and IRA limits were not yet announced on 2026-11-02 and the tool says so instead of guessing.",
      inputSchema: {
        year,
        account: z.enum(ACCOUNTS).optional().describe("Which limits: all (default), 401k, 403b, 457b, tsp, simple, ira, roth_ira, hsa, 415c, hce, social_security."),
      },
      annotations: { ...RO, title: "Contribution limits (2025-2027)" },
    },
    async (a) => run(() => {
      const r = getContributionLimits(a) as Record<string, any>;
      const parts: string[] = [];
      const k = r["401k_403b_tsp"];
      if (k) parts.push(`401(k)/403(b)/TSP deferral ${money(k.elective_deferral)}, catch-up ${money(k.catch_up_50_plus)} at 50+ (total ${money(k.total_age_50_59_or_64_plus)}), ${money(k.super_catch_up_60_63)} at 60-63 (total ${money(k.total_age_60_63)})`);
      if (r.ira) parts.push(`IRA ${money(r.ira.limit)} plus ${money(r.ira.catch_up_50_plus)} at 50+`);
      if (r.simple) parts.push(`SIMPLE ${money(r.simple.deferral)} plus ${money(r.simple.catch_up_50_plus)} at 50+`);
      if (r.total_annual_additions_415c) parts.push(`415(c) total ${money(r.total_annual_additions_415c.limit)}`);
      if (r.compensation_and_hce) parts.push(`HCE threshold ${money(r.compensation_and_hce.highly_compensated_threshold)}, compensation limit ${money(r.compensation_and_hce.compensation_limit_401a17)}`);
      if (r.hsa) parts.push(`HSA ${money(r.hsa.self_only)} self-only / ${money(r.hsa.family)} family plus ${money(r.hsa.catch_up_55_plus)} at 55+`);
      if (r.social_security_wage_base) parts.push(`Social Security wage base ${money(r.social_security_wage_base)}`);
      let s = `${r.year} limits: ${parts.join("; ") || "none for this account"}.`;
      if (r.not_published) s += ` ${r.not_published}`;
      const src = a.account === "hsa" ? r.hsa.source : a.account === "social_security" ? SOURCES[`ssa${r.year}` as "ssa2027"] : planSource(a.year);
      const page = a.account === "hsa" ? PAGES.hsa : a.account === "social_security" ? PAGES.ss : PAGES.plan;
      return reply(s, r, src, page);
    }),
  );

  server.registerTool(
    "calculate_max_contribution",
    {
      title: "Maximum contribution by age, year and plans",
      description:
        "Calculates the most a person can contribute for a year given age (on Dec. 31), plans held (401k, 403b, 457b, tsp, simple, ira, hsa_self, hsa_family) and optional wages. Applies the age 50+ catch-up, the SECURE 2.0 age 60-63 super catch-up (eligible only if age 60, 61, 62 or 63 at year end; 64 drops back), the HSA $1,000 catch-up at 55, the shared 402(g) limit across 401(k)/403(b)/TSP/SIMPLE, the separate 457(b) limit, and the compensation cap. With prior_year_fica_wages it tells whether catch-ups must be Roth under SECURE 2.0 section 603 (2026: over $150,000 of 2025 FICA wages).",
      inputSchema: {
        age: z.number().int().min(14).max(120).describe("Age on December 31 of the year."),
        year,
        plans: z.array(z.enum(PLANS)).min(1).max(8).describe("Plans the person contributes to, e.g. [\"401k\",\"ira\",\"hsa_family\"]."),
        wages: z.number().min(0).max(1e9).optional().describe("Compensation for the year in USD, used to cap deferrals and IRA contributions."),
        prior_year_fica_wages: z.number().min(0).max(1e9).optional().describe("Prior-year FICA wages (W-2 box 3) from the plan sponsor, for the Roth catch-up rule."),
        plan_offers_super_catch_up: z.boolean().optional().describe("False if the employer plan does not offer the age 60-63 catch-up. Default true."),
        simple_higher_limits: z.boolean().optional().describe("True if the SIMPLE plan uses the higher small-employer limits."),
      },
      annotations: { ...RO, title: "Maximum contribution by age, year and plans" },
    },
    async (a) => run(() => {
      const r = calculateMaxContribution(a) as Record<string, any>;
      const lines = (r.contributions as any[]).map((l) => `${l.plan} ${money(l.max_employee_contribution)}${l.catch_up ? ` (incl. ${money(l.catch_up)} ${String(l.catch_up_type).replace(/_/g, " ")} catch-up)` : ""}`);
      let s = `Age ${r.age} in ${r.year}: ${lines.join("; ")}. Combined employee maximum ${money(r.total_max_employee_contributions)}.`;
      if (r.super_catch_up_eligible) s += " Eligible for the age 60-63 super catch-up.";
      if (r.roth_catch_up && r.roth_catch_up.must_be_roth === true) s += " Catch-up contributions must be Roth because prior-year FICA wages exceed the threshold.";
      if (r.roth_catch_up && r.roth_catch_up.must_be_roth === false && r.year > 2025) s += " Catch-ups can be pre-tax or Roth (wages at or under the threshold).";
      const hsaOnly = a.plans.every((p) => p.startsWith("hsa"));
      return reply(s, r, hsaOnly ? SOURCES[`hsa${r.year}` as "hsa2027"] : `${planSource(a.year)} ; ${SOURCES.rothCatchUpRegs}`, hsaOnly ? PAGES.hsa : PAGES.plan);
    }),
  );

  server.registerTool(
    "get_social_security_cola",
    {
      title: "Social Security COLA, wage base and earnings test",
      description:
        "Returns the Social Security cost-of-living adjustment and related figures from SSA's official annual notice in the Federal Register: 2027 COLA 3.6% (announced October 2026), 2027 taxable maximum (wage base) $192,300, retirement earnings test limits ($25,560 under full retirement age, $67,920 in the year you reach it, for 2027), quarter of coverage, SGA amounts and SSI federal payment. Covers 2025, 2026 and 2027.",
      inputSchema: { year },
      annotations: { ...RO, title: "Social Security COLA, wage base and earnings test" },
    },
    async (a) => run(() => {
      const r = getSocialSecurity(a);
      const e = r.earnings_test;
      const s = `${r.year} Social Security: COLA ${r.cola_percent}% (${r.cola_effective}). Wage base ${money(r.wage_base)}. Earnings test ${money(e.under_full_retirement_age.annual)} a year under full retirement age ($1 withheld per $2 over), ${money(e.year_reaching_full_retirement_age.annual)} in the year you reach it ($1 per $3 over). Quarter of coverage ${money(r.quarter_of_coverage)}. SSI federal payment ${money(r.ssi_federal_payment_monthly.individual)} a month for an individual.`;
      return reply(s, r, r.source, PAGES.ss);
    }),
  );

  server.registerTool(
    "compare_years",
    {
      title: "Compare limits between 2025, 2026 and 2027",
      description:
        "Shows each retirement, IRA, HSA and Social Security figure for two years side by side with the dollar and percent change: 401(k) deferral, catch-ups, 415(c), compensation limit, HCE threshold, SIMPLE, IRA, Roth catch-up threshold, HSA, wage base, earnings test and COLA. Items the IRS has not yet published (2027 plan limits on 2026-11-02) come back as null, never estimated.",
      inputSchema: {
        from_year: year,
        to_year: year,
      },
      annotations: { ...RO, title: "Compare limits between years" },
    },
    async (a) => run(() => {
      const r = compareYears(a);
      const pick = (label: string) => r.rows.find((x) => x.item === label)!;
      const fmt = (label: string) => { const x = pick(label); return x.from === null || x.to === null ? `${label}: ${x.from === null ? "n/a" : money(x.from)} to ${x.to === null ? "not published" : money(x.to)}` : `${label}: ${money(x.from)} to ${money(x.to)} (${x.change! >= 0 ? "+" : ""}${money(x.change!)})`; };
      let s = `${r.from_year} to ${r.to_year}. ${fmt("401(k)/403(b)/TSP elective deferral")}. ${fmt("IRA limit")}. ${fmt("HSA self-only")}. ${fmt("HSA family")}. ${fmt("Social Security wage base")}.`;
      if (r.not_published) s += " 2027 plan and IRA limits are not published yet.";
      return reply(s, r, `${planSource(Math.max(a.from_year, a.to_year) === 2027 ? 2026 : Math.max(a.from_year, a.to_year))} ; ${SOURCES.hsa2027} ; ${SOURCES.ssa2027}`, PAGES.plan);
    }),
  );
}

export function createServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  registerTools(server);
  return server;
}
