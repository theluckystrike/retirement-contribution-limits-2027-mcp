// Pure core: 2025-2027 retirement plan, IRA and HSA contribution limits, the SECURE 2.0 age 60-63
// super catch-up and Roth catch-up rule, and Social Security COLA / wage base / earnings test.
// No I/O. Every number was copied from an irs.gov or Federal Register (SSA notice) document fetched
// on 2026-11-02; see DATA_SOURCES.md.

export const AS_OF = "2026-11-02";
export const REPO = "retirement-contribution-limits-2027-mcp";
export const DISCLAIMER =
  "This is general information, not tax or financial advice. Your plan document may allow less (for example no age 60-63 catch-up). Check with your plan administrator or a tax professional.";

export const SOURCES = {
  notice2025_67: "https://www.irs.gov/pub/irs-drop/n-25-67.pdf",
  notice2024_80: "https://www.irs.gov/pub/irs-drop/n-24-80.pdf",
  ir2026Limits: "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500",
  irsNews: "https://www.irs.gov/newsroom/news-releases-for-current-month",
  hsa2027: "https://www.irs.gov/pub/irs-drop/rp-26-24.pdf",
  hsa2026: "https://www.irs.gov/pub/irs-drop/rp-25-19.pdf",
  hsa2025: "https://www.irs.gov/pub/irs-drop/rp-24-25.pdf",
  p969: "https://www.irs.gov/pub/irs-pdf/p969.pdf",
  rothCatchUpRegs: "https://www.irs.gov/newsroom/treasury-irs-issue-final-regulations-on-new-roth-catch-up-rule-other-secure-2point0-act-provisions",
  ssa2027: "https://www.federalregister.gov/documents/2026/10/26/2026-21796/cost-of-living-increase-and-other-determinations-for-2027",
  ssa2026: "https://www.federalregister.gov/documents/2025/11/03/2025-19763/cost-of-living-increase-and-other-determinations-for-2026",
  ssa2025: "https://www.federalregister.gov/documents/2024/10/25/2024-24871/cost-of-living-increase-and-other-determinations-for-2025",
} as const;

const SITE = "https://statewage.com";
export const PAGES = {
  plan: "/401k-paycheck-calculator/",
  hsa: "/hsa-paycheck-calculator/",
  ss: "/social-security-tax-calculator/",
} as const;
export function moreUrl(path: string): string {
  return `${SITE}${path}?utm_source=mcp&utm_medium=${REPO}`;
}

export class InputError extends Error {}

export const YEARS = [2025, 2026, 2027] as const;
export type Year = (typeof YEARS)[number];

// ---------------------------------------------------------------- IRS plan and IRA limits
// 2025: Notice 2024-80. 2026: Notice 2025-67 (IR-2025-111). 2027: not published on 2026-11-02.
export interface PlanLimits {
  elective_deferral_401k_403b_tsp: number; // 402(g)(1)
  deferral_457b: number; // 457(e)(15)
  catch_up_50_plus: number; // 414(v)(2)(B)(i)
  super_catch_up_60_63: number; // 414(v)(2)(E)(i)
  total_annual_additions_415c: number; // 415(c)(1)(A)
  defined_benefit_415b: number; // 415(b)(1)(A)
  compensation_limit_401a17: number;
  highly_compensated_threshold_414q: number;
  key_employee_threshold_416i: number;
  simple_deferral: number; // 408(p)(2)(E)(i)(III)
  simple_deferral_higher: number; // 408(p)(2)(E)(i)(I)/(II), small employers
  simple_catch_up_50_plus: number; // 414(v)(2)(B)(ii)
  simple_catch_up_higher: number; // 414(v)(2)(B)(iii)
  simple_super_catch_up_60_63: number; // 414(v)(2)(E)(ii)
  ira: number; // 219(b)(5)(A)
  ira_catch_up_50_plus: number; // 219(b)(5)(B)
  roth_ira_phase_out_single: [number, number];
  roth_ira_phase_out_joint: [number, number];
  roth_catch_up_wage_threshold: number; // 414(v)(7)(A), prior-year FICA wages
  roth_catch_up_wage_year: number;
  source: string;
}

export const PLAN_LIMITS: Partial<Record<Year, PlanLimits>> = {
  2025: {
    elective_deferral_401k_403b_tsp: 23500, deferral_457b: 23500, catch_up_50_plus: 7500, super_catch_up_60_63: 11250,
    total_annual_additions_415c: 70000, defined_benefit_415b: 280000, compensation_limit_401a17: 350000,
    highly_compensated_threshold_414q: 160000, key_employee_threshold_416i: 230000,
    simple_deferral: 16500, simple_deferral_higher: 17600, simple_catch_up_50_plus: 3500, simple_catch_up_higher: 3850,
    simple_super_catch_up_60_63: 5250, ira: 7000, ira_catch_up_50_plus: 1000,
    roth_ira_phase_out_single: [150000, 165000], roth_ira_phase_out_joint: [236000, 246000],
    roth_catch_up_wage_threshold: 145000, roth_catch_up_wage_year: 2024,
    source: SOURCES.notice2024_80,
  },
  2026: {
    elective_deferral_401k_403b_tsp: 24500, deferral_457b: 24500, catch_up_50_plus: 8000, super_catch_up_60_63: 11250,
    total_annual_additions_415c: 72000, defined_benefit_415b: 290000, compensation_limit_401a17: 360000,
    highly_compensated_threshold_414q: 160000, key_employee_threshold_416i: 235000,
    simple_deferral: 17000, simple_deferral_higher: 18100, simple_catch_up_50_plus: 4000, simple_catch_up_higher: 3850,
    simple_super_catch_up_60_63: 5250, ira: 7500, ira_catch_up_50_plus: 1100,
    roth_ira_phase_out_single: [153000, 168000], roth_ira_phase_out_joint: [242000, 252000],
    roth_catch_up_wage_threshold: 150000, roth_catch_up_wage_year: 2025,
    source: SOURCES.notice2025_67,
  },
};

export const NOT_PUBLISHED_2027 =
  "The IRS has not announced the 2027 401(k), 403(b), 457, IRA, SIMPLE, 415(c), compensation or HCE limits. On 2026-11-02 the IRS news release list ran through IR-2026-129 (Oct. 29, 2026) with no cost-of-living notice for 2027 (the 2026 notice, IR-2025-111 / Notice 2025-67, came out in November 2025). This server does not guess or forecast. Use 2026 as the latest published year.";

// ---------------------------------------------------------------- HSA limits (Rev. Procs.)
export interface HsaLimits { self_only: number; family: number; catch_up_55_plus: number; hdhp_min_deductible_self: number; hdhp_min_deductible_family: number; hdhp_oop_max_self: number; hdhp_oop_max_family: number; source: string }
export const HSA_LIMITS: Record<Year, HsaLimits> = {
  2025: { self_only: 4300, family: 8550, catch_up_55_plus: 1000, hdhp_min_deductible_self: 1650, hdhp_min_deductible_family: 3300, hdhp_oop_max_self: 8300, hdhp_oop_max_family: 16600, source: SOURCES.hsa2025 },
  2026: { self_only: 4400, family: 8750, catch_up_55_plus: 1000, hdhp_min_deductible_self: 1700, hdhp_min_deductible_family: 3400, hdhp_oop_max_self: 8500, hdhp_oop_max_family: 17000, source: SOURCES.hsa2026 },
  2027: { self_only: 4500, family: 9000, catch_up_55_plus: 1000, hdhp_min_deductible_self: 1750, hdhp_min_deductible_family: 3500, hdhp_oop_max_self: 8700, hdhp_oop_max_family: 17400, source: SOURCES.hsa2027 },
};

// ---------------------------------------------------------------- Social Security (SSA notices)
export interface SocialSecurity {
  cola_percent: number; cola_effective: string;
  wage_base: number;
  earnings_test_monthly_under_fra: number; earnings_test_monthly_year_of_fra: number;
  quarter_of_coverage: number;
  sga_monthly_non_blind: number | null; sga_monthly_blind: number | null;
  ssi_individual: number; ssi_couple: number;
  source: string;
}
export const SOCIAL_SECURITY: Record<Year, SocialSecurity> = {
  2025: { cola_percent: 2.5, cola_effective: "December 2024 benefits, payable January 2025", wage_base: 176100, earnings_test_monthly_under_fra: 1950, earnings_test_monthly_year_of_fra: 5180, quarter_of_coverage: 1810, sga_monthly_non_blind: null, sga_monthly_blind: null, ssi_individual: 967, ssi_couple: 1450, source: SOURCES.ssa2025 },
  2026: { cola_percent: 2.8, cola_effective: "December 2025 benefits, payable January 2026", wage_base: 184500, earnings_test_monthly_under_fra: 2040, earnings_test_monthly_year_of_fra: 5430, quarter_of_coverage: 1890, sga_monthly_non_blind: 1690, sga_monthly_blind: 2830, ssi_individual: 994, ssi_couple: 1491, source: SOURCES.ssa2026 },
  2027: { cola_percent: 3.6, cola_effective: "December 2026 benefits, payable January 2027", wage_base: 192300, earnings_test_monthly_under_fra: 2130, earnings_test_monthly_year_of_fra: 5660, quarter_of_coverage: 1970, sga_monthly_non_blind: 1770, sga_monthly_blind: 2950, ssi_individual: 1029, ssi_couple: 1544, source: SOURCES.ssa2027 },
};

export function requireYear(y: number): Year {
  if ((YEARS as readonly number[]).includes(y)) return y as Year;
  throw new InputError(`year must be 2025, 2026 or 2027. ${y > 2027 ? `${y} limits are not published.` : "Earlier years are not covered."}`);
}

export function planLimits(y: Year): PlanLimits | null {
  return PLAN_LIMITS[y] ?? null;
}

// ---------------------------------------------------------------- get_contribution_limits
export const ACCOUNTS = ["all", "401k", "403b", "457b", "tsp", "simple", "ira", "roth_ira", "hsa", "415c", "hce", "social_security"] as const;
export type Account = (typeof ACCOUNTS)[number];

export function getContributionLimits(input: { year: number; account?: Account }) {
  const year = requireYear(input.year);
  const account = input.account ?? "all";
  const p = planLimits(year);
  const h = HSA_LIMITS[year];
  const ss = SOCIAL_SECURITY[year];
  const ira = p && { limit: p.ira, catch_up_50_plus: p.ira_catch_up_50_plus, total_50_plus: p.ira + p.ira_catch_up_50_plus, note: "One limit shared by all traditional and Roth IRAs; capped at taxable compensation." };
  const plan = p && {
    elective_deferral: p.elective_deferral_401k_403b_tsp,
    catch_up_50_plus: p.catch_up_50_plus,
    super_catch_up_60_63: p.super_catch_up_60_63,
    total_age_50_59_or_64_plus: p.elective_deferral_401k_403b_tsp + p.catch_up_50_plus,
    total_age_60_63: p.elective_deferral_401k_403b_tsp + p.super_catch_up_60_63,
  };
  const out: Record<string, unknown> = { year, account, plan_limits_published: !!p };
  const want = (a: Account[]) => account === "all" || a.includes(account);
  if (want(["401k", "403b", "tsp"])) out["401k_403b_tsp"] = plan ?? null;
  if (want(["457b"])) out["governmental_457b"] = p ? { ...plan, elective_deferral: p.deferral_457b, note: "Separate from the 401(k)/403(b) limit, so a worker with both can defer to each. Age 50+ catch-up applies to governmental 457(b) only. The special last-3-years 457 catch-up is not covered." } : null;
  if (want(["simple"])) out.simple = p ? { deferral: p.simple_deferral, catch_up_50_plus: p.simple_catch_up_50_plus, super_catch_up_60_63: p.simple_super_catch_up_60_63, deferral_small_employer_higher: p.simple_deferral_higher, catch_up_small_employer_higher: p.simple_catch_up_higher, note: "Higher SIMPLE limits apply to employers with 25 or fewer employees, or 26-100 that elect a higher contribution (SECURE 2.0 sec. 117)." } : null;
  if (want(["ira", "roth_ira"])) out.ira = ira ? { ...ira, roth_ira_phase_out_single_hoh: p!.roth_ira_phase_out_single, roth_ira_phase_out_married_joint: p!.roth_ira_phase_out_joint } : null;
  if (want(["415c"])) out.total_annual_additions_415c = p ? { limit: p.total_annual_additions_415c, note: "Employee plus employer contributions to one employer's defined contribution plans, capped at 100% of compensation. Catch-up contributions are on top." } : null;
  if (want(["hce", "415c", "401k"])) out.compensation_and_hce = p ? { compensation_limit_401a17: p.compensation_limit_401a17, highly_compensated_threshold: p.highly_compensated_threshold_414q, key_employee_threshold: p.key_employee_threshold_416i, defined_benefit_415b: p.defined_benefit_415b } : null;
  if (want(["401k", "403b", "457b", "tsp"])) out.roth_catch_up_rule = rothCatchUpRule(year);
  if (want(["hsa"])) out.hsa = h;
  if (want(["social_security"])) out.social_security_wage_base = ss.wage_base;
  if (!p && account !== "hsa" && account !== "social_security") out.not_published = NOT_PUBLISHED_2027;
  return out;
}

// ---------------------------------------------------------------- Roth catch-up (SECURE 2.0 sec. 603)
export function rothCatchUpRule(year: Year) {
  const p = planLimits(year);
  const base = {
    rule: "If your FICA wages (Form W-2 box 3) from the employer sponsoring the plan were over the threshold in the prior year, your age-50+ (and age 60-63) catch-up contributions to a 401(k), 403(b) or governmental 457(b) must be Roth. SIMPLE IRAs and SEPs are exempt.",
    statute: "IRC 414(v)(7), added by SECURE 2.0 Act section 603",
  };
  if (year === 2025) {
    return { ...base, required_this_year: false, wage_threshold: p!.roth_catch_up_wage_threshold, wage_year: 2024, status: "Administrative transition period under Notice 2023-62 ran through Dec. 31, 2025, so plans did not have to enforce the rule for 2025." };
  }
  if (year === 2026) {
    return { ...base, required_this_year: true, wage_threshold: p!.roth_catch_up_wage_threshold, wage_year: 2025, status: "Transition relief ended Dec. 31, 2025. The final regulations (IR-2025-91, Sept. 15, 2025) generally apply to taxable years beginning after Dec. 31, 2026; for 2026 plans apply the rule with a reasonable, good-faith interpretation of the statute. Later dates apply to some governmental and collectively bargained plans." };
  }
  return { ...base, required_this_year: true, wage_threshold: null, wage_year: 2026, status: "Final regulations generally apply to taxable years beginning after Dec. 31, 2026, so 2027 is the first year under the final rules. The threshold for 2027 contributions (indexed, applied to 2026 wages) will be in the IRS 2027 cost-of-living notice, which was not published on 2026-11-02. The 2026 figure was $150,000 of 2025 wages." };
}

// ---------------------------------------------------------------- calculate_max_contribution
export const PLANS = ["401k", "403b", "457b", "tsp", "simple", "ira", "hsa_self", "hsa_family"] as const;
export type Plan = (typeof PLANS)[number];

export interface MaxInput { age: number; year: number; plans: Plan[]; wages?: number; prior_year_fica_wages?: number; plan_offers_super_catch_up?: boolean; simple_higher_limits?: boolean }

export function catchUpTier(age: number): "none" | "age_50_plus" | "age_60_63" {
  if (age >= 60 && age <= 63) return "age_60_63";
  if (age >= 50) return "age_50_plus";
  return "none";
}

const r0 = (x: number) => Math.round(x);

export function calculateMaxContribution(input: MaxInput) {
  const year = requireYear(input.year);
  if (!Number.isInteger(input.age) || input.age < 14 || input.age > 120) throw new InputError("age must be a whole number from 14 to 120 (age on December 31 of the year).");
  if (!input.plans?.length) throw new InputError("plans must list at least one of: " + PLANS.join(", "));
  const plans = [...new Set(input.plans)];
  if (plans.includes("hsa_self") && plans.includes("hsa_family")) throw new InputError("Pick hsa_self or hsa_family, not both.");
  const wages = input.wages;
  if (wages !== undefined && (!Number.isFinite(wages) || wages < 0)) throw new InputError("wages must be 0 or more.");
  const p = planLimits(year);
  const needsPlan = plans.some((x) => !x.startsWith("hsa"));
  if (needsPlan && !p) throw new InputError(NOT_PUBLISHED_2027 + " HSA limits for 2027 are published: use plans [\"hsa_self\"] or [\"hsa_family\"] for 2027.");
  const tier = catchUpTier(input.age);
  const offersSuper = input.plan_offers_super_catch_up !== false;
  const lines: Array<Record<string, unknown>> = [];
  const notes: string[] = [];

  // Roth catch-up status
  let rothCatchUp: Record<string, unknown> | null = null;
  const employerPlans = plans.filter((x) => ["401k", "403b", "457b", "tsp"].includes(x));
  if (p && employerPlans.length && tier !== "none") {
    const rule = rothCatchUpRule(year);
    const fw = input.prior_year_fica_wages;
    let mustBeRoth: boolean | null = null;
    if (year === 2025) mustBeRoth = false;
    else if (fw !== undefined && rule.wage_threshold !== null) mustBeRoth = fw > rule.wage_threshold;
    rothCatchUp = { must_be_roth: mustBeRoth, threshold: rule.wage_threshold, wage_year: rule.wage_year, prior_year_fica_wages: fw ?? null, status: rule.status };
    if (mustBeRoth === null && year === 2026) notes.push("Give prior_year_fica_wages (2025 W-2 box 3 from this employer) to check the Roth catch-up rule: over $150,000 means catch-ups must be Roth.");
  }

  // 402(g) group: 401(k), 403(b), TSP and SIMPLE deferrals share one personal limit.
  const g = plans.filter((x) => ["401k", "403b", "tsp"].includes(x));
  if (g.length && p) {
    const base = p.elective_deferral_401k_403b_tsp;
    const cu = tier === "age_60_63" ? (offersSuper ? p.super_catch_up_60_63 : p.catch_up_50_plus) : tier === "age_50_plus" ? p.catch_up_50_plus : 0;
    let total = base + cu;
    if (wages !== undefined && wages < total) { total = r0(wages); notes.push("Deferrals cannot exceed your compensation from the employer, so the total is capped at wages."); }
    lines.push({ plan: g.join(" + "), shared_limit: true, base_limit: base, catch_up: cu, catch_up_type: cu === 0 ? "none" : tier === "age_60_63" && offersSuper ? "age_60_63_super" : "age_50_plus", max_employee_contribution: total, total_with_employer_415c: p.total_annual_additions_415c + cu });
    if (g.length > 1) notes.push("401(k), 403(b) and TSP deferrals share one limit per person, not one per plan.");
    if (tier === "age_60_63" && !offersSuper) notes.push("Your plan does not offer the age 60-63 catch-up, so the regular age 50+ catch-up was used.");
  }
  if (plans.includes("457b") && p) {
    const cu = tier === "age_60_63" ? (offersSuper ? p.super_catch_up_60_63 : p.catch_up_50_plus) : tier === "age_50_plus" ? p.catch_up_50_plus : 0;
    let total = p.deferral_457b + cu;
    if (wages !== undefined && wages < total) total = r0(wages);
    lines.push({ plan: "457b", shared_limit: false, base_limit: p.deferral_457b, catch_up: cu, catch_up_type: cu === 0 ? "none" : tier === "age_60_63" && offersSuper ? "age_60_63_super" : "age_50_plus", max_employee_contribution: total, note: "Separate limit from 401(k)/403(b). Catch-up shown applies to governmental 457(b) plans." });
  }
  if (plans.includes("simple") && p) {
    const hi = input.simple_higher_limits === true;
    const base = hi ? p.simple_deferral_higher : p.simple_deferral;
    const cu = tier === "age_60_63" ? (offersSuper ? p.simple_super_catch_up_60_63 : hi ? p.simple_catch_up_higher : p.simple_catch_up_50_plus) : tier === "age_50_plus" ? (hi ? p.simple_catch_up_higher : p.simple_catch_up_50_plus) : 0;
    let total = base + cu;
    if (wages !== undefined && wages < total) total = r0(wages);
    lines.push({ plan: "simple", shared_limit: g.length > 0, base_limit: base, catch_up: cu, catch_up_type: cu === 0 ? "none" : tier === "age_60_63" && offersSuper ? "age_60_63_super" : "age_50_plus", max_employee_contribution: total, higher_small_employer_limits: hi });
    if (g.length) notes.push("SIMPLE deferrals also count toward the same personal 402(g) limit as 401(k)/403(b) deferrals; the combined total cannot exceed the 401(k) figure.");
  }
  if (plans.includes("ira") && p) {
    const cu = tier === "none" ? 0 : p.ira_catch_up_50_plus;
    let total = p.ira + cu;
    if (wages !== undefined && wages < total) { total = r0(wages); notes.push("IRA contributions are capped at taxable compensation (a spousal IRA can use the spouse's compensation)."); }
    lines.push({ plan: "ira", shared_limit: false, base_limit: p.ira, catch_up: cu, catch_up_type: cu ? "age_50_plus" : "none", max_employee_contribution: total, note: "One limit across traditional and Roth IRAs. Roth IRA eligibility phases out by income." });
  }
  const hsaPlan = plans.find((x) => x.startsWith("hsa"));
  if (hsaPlan) {
    const h = HSA_LIMITS[year];
    const base = hsaPlan === "hsa_self" ? h.self_only : h.family;
    const cu = input.age >= 55 ? h.catch_up_55_plus : 0;
    lines.push({ plan: hsaPlan, shared_limit: false, base_limit: base, catch_up: cu, catch_up_type: cu ? "age_55_plus" : "none", max_employee_contribution: base + cu, note: "Includes employer HSA contributions. Prorated by months of HDHP coverage; no contributions after Medicare enrollment." });
  }

  const deferralGroup = lines.filter((l) => l.plan !== "ira" && !(String(l.plan).startsWith("hsa")) && l.plan !== "457b");
  let grand = lines.reduce((s, l) => s + (l.max_employee_contribution as number), 0);
  if (deferralGroup.length > 1 && p) {
    // 401k-type and SIMPLE share 402(g): keep the larger line only.
    const maxG = Math.max(...deferralGroup.map((l) => l.max_employee_contribution as number));
    grand = grand - deferralGroup.reduce((s, l) => s + (l.max_employee_contribution as number), 0) + maxG;
  }
  return {
    year, age: input.age, catch_up_tier: tier,
    super_catch_up_eligible: tier === "age_60_63",
    super_catch_up_rule: "The higher catch-up applies if you attain age 60, 61, 62 or 63 by Dec. 31 of the year (IRC 414(v)(2)(E), SECURE 2.0 sec. 109). At 64 you return to the regular age 50+ catch-up. Plans are not required to offer it.",
    contributions: lines, total_max_employee_contributions: grand,
    roth_catch_up: rothCatchUp, notes,
  };
}

// ---------------------------------------------------------------- get_social_security_cola
export function getSocialSecurity(input: { year: number }) {
  const year = requireYear(input.year);
  const s = SOCIAL_SECURITY[year];
  return {
    year, cola_percent: s.cola_percent, cola_effective: s.cola_effective,
    wage_base: s.wage_base,
    earnings_test: {
      under_full_retirement_age: { monthly: s.earnings_test_monthly_under_fra, annual: s.earnings_test_monthly_under_fra * 12, withholding: "$1 of benefits for every $2 earned over the limit" },
      year_reaching_full_retirement_age: { monthly: s.earnings_test_monthly_year_of_fra, annual: s.earnings_test_monthly_year_of_fra * 12, withholding: "$1 for every $3 over the limit, counting only earnings before the month you reach FRA" },
      from_full_retirement_age: "No earnings limit.",
    },
    quarter_of_coverage: s.quarter_of_coverage,
    substantial_gainful_activity_monthly: { non_blind: s.sga_monthly_non_blind, blind: s.sga_monthly_blind },
    ssi_federal_payment_monthly: { individual: s.ssi_individual, couple: s.ssi_couple },
    max_benefit_at_full_retirement_age: null,
    max_benefit_note: "Not in SSA's Federal Register notice; it is on SSA's fact sheet (ssa.gov), which this server could not fetch on 2026-11-02, so it is left out rather than guessed.",
    source: s.source,
  };
}

// ---------------------------------------------------------------- compare_years
export function compareYears(input: { from_year: number; to_year: number }) {
  const a = requireYear(input.from_year);
  const b = requireYear(input.to_year);
  if (a === b) throw new InputError("from_year and to_year must differ.");
  const rows: Array<{ item: string; from: number | null; to: number | null; change: number | null; percent: number | null }> = [];
  const add = (item: string, x: number | null | undefined, y: number | null | undefined) => {
    const f = x ?? null, t = y ?? null;
    const change = f !== null && t !== null ? t - f : null;
    rows.push({ item, from: f, to: t, change, percent: change !== null && f ? Math.round((change / f) * 10000) / 100 : null });
  };
  const pa = planLimits(a), pb = planLimits(b);
  const planKeys: Array<[string, keyof PlanLimits]> = [
    ["401(k)/403(b)/TSP elective deferral", "elective_deferral_401k_403b_tsp"], ["457(b) deferral", "deferral_457b"],
    ["Catch-up age 50+", "catch_up_50_plus"], ["Super catch-up age 60-63", "super_catch_up_60_63"],
    ["415(c) total annual additions", "total_annual_additions_415c"], ["401(a)(17) compensation limit", "compensation_limit_401a17"],
    ["Highly compensated employee threshold", "highly_compensated_threshold_414q"], ["SIMPLE deferral", "simple_deferral"],
    ["SIMPLE catch-up age 50+", "simple_catch_up_50_plus"], ["IRA limit", "ira"], ["IRA catch-up age 50+", "ira_catch_up_50_plus"],
    ["Roth catch-up wage threshold", "roth_catch_up_wage_threshold"],
  ];
  for (const [label, k] of planKeys) add(label, pa ? (pa[k] as number) : null, pb ? (pb[k] as number) : null);
  add("HSA self-only", HSA_LIMITS[a].self_only, HSA_LIMITS[b].self_only);
  add("HSA family", HSA_LIMITS[a].family, HSA_LIMITS[b].family);
  add("Social Security wage base", SOCIAL_SECURITY[a].wage_base, SOCIAL_SECURITY[b].wage_base);
  add("Earnings test annual (under FRA)", SOCIAL_SECURITY[a].earnings_test_monthly_under_fra * 12, SOCIAL_SECURITY[b].earnings_test_monthly_under_fra * 12);
  add("Earnings test annual (year of FRA)", SOCIAL_SECURITY[a].earnings_test_monthly_year_of_fra * 12, SOCIAL_SECURITY[b].earnings_test_monthly_year_of_fra * 12);
  add("Social Security COLA percent", SOCIAL_SECURITY[a].cola_percent, SOCIAL_SECURITY[b].cola_percent);
  const unpublished = [a, b].filter((y) => !planLimits(y));
  return { from_year: a, to_year: b, rows, not_published: unpublished.length ? NOT_PUBLISHED_2027 : null };
}
