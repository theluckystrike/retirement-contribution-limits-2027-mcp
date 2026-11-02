// Fixtures: expected values copied from IRS Notice 2024-80, Notice 2025-67, Rev. Procs. 2024-25,
// 2025-19 and 2026-24, Pub. 969, IR-2025-91 and SSA's Federal Register COLA notices for 2025-2027,
// or hand-checked arithmetic on those figures.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getContributionLimits as limits, calculateMaxContribution as maxc, getSocialSecurity as ss,
  compareYears as cmp, catchUpTier, InputError,
} from "../dist/core.js";

test("F1 Notice 2025-67: 2026 401(k) $24,500, catch-up $8,000, 60-63 $11,250", () => {
  const k = limits({ year: 2026, account: "401k" })["401k_403b_tsp"];
  assert.equal(k.elective_deferral, 24500);
  assert.equal(k.catch_up_50_plus, 8000);
  assert.equal(k.super_catch_up_60_63, 11250);
  assert.equal(k.total_age_60_63, 35750);
});

test("F2 Notice 2024-80: 2025 401(k) $23,500, catch-up $7,500, 415(c) $70,000", () => {
  const r = limits({ year: 2025 });
  assert.equal(r["401k_403b_tsp"].elective_deferral, 23500);
  assert.equal(r["401k_403b_tsp"].catch_up_50_plus, 7500);
  assert.equal(r.total_annual_additions_415c.limit, 70000);
});

test("F3 Notice 2025-67: 2026 IRA $7,500 + $1,100, 415(c) $72,000, comp $360,000, HCE $160,000", () => {
  const r = limits({ year: 2026 });
  assert.equal(r.ira.limit, 7500);
  assert.equal(r.ira.catch_up_50_plus, 1100);
  assert.equal(r.total_annual_additions_415c.limit, 72000);
  assert.equal(r.compensation_and_hce.compensation_limit_401a17, 360000);
  assert.equal(r.compensation_and_hce.highly_compensated_threshold, 160000);
});

test("F4 Rev. Proc. 2026-24: 2027 HSA $4,500 self / $9,000 family", () => {
  const h = limits({ year: 2027, account: "hsa" }).hsa;
  assert.equal(h.self_only, 4500);
  assert.equal(h.family, 9000);
  assert.equal(h.hdhp_min_deductible_self, 1750);
});

test("F5 2027 plan limits not published: null plus a clear message, never a guess", () => {
  const r = limits({ year: 2027, account: "401k" });
  assert.equal(r["401k_403b_tsp"], null);
  assert.equal(r.plan_limits_published, false);
  assert.match(r.not_published, /not announced/);
});

test("F6 super catch-up tiers: 59 -> 50+, 60 and 63 -> 60-63, 64 -> 50+, 49 -> none", () => {
  assert.equal(catchUpTier(59), "age_50_plus");
  assert.equal(catchUpTier(60), "age_60_63");
  assert.equal(catchUpTier(63), "age_60_63");
  assert.equal(catchUpTier(64), "age_50_plus");
  assert.equal(catchUpTier(49), "none");
});

test("F7 age 61 in 2026 with 401(k): 24,500 + 11,250 = 35,750", () => {
  const r = maxc({ age: 61, year: 2026, plans: ["401k"] });
  assert.equal(r.contributions[0].max_employee_contribution, 35750);
  assert.equal(r.super_catch_up_eligible, true);
});

test("F8 age 64 in 2026: back to 24,500 + 8,000 = 32,500", () => {
  const r = maxc({ age: 64, year: 2026, plans: ["403b"] });
  assert.equal(r.contributions[0].max_employee_contribution, 32500);
});

test("F9 age 62 plan without super catch-up: 24,500 + 8,000", () => {
  const r = maxc({ age: 62, year: 2026, plans: ["401k"], plan_offers_super_catch_up: false });
  assert.equal(r.contributions[0].max_employee_contribution, 32500);
});

test("F10 401(k) + governmental 457(b) at 55 in 2026: two separate limits 32,500 each = 65,000", () => {
  const r = maxc({ age: 55, year: 2026, plans: ["401k", "457b"] });
  assert.equal(r.total_max_employee_contributions, 65000);
});

test("F11 401(k) + IRA + HSA family at 56 in 2026: 32,500 + 8,600 + 9,750 = 50,850", () => {
  const r = maxc({ age: 56, year: 2026, plans: ["401k", "ira", "hsa_family"] });
  assert.equal(r.total_max_employee_contributions, 50850);
});

test("F12 Pub. 969: HSA 55+ catch-up $1,000; 2025 self-only 4,300 + 1,000 = 5,300", () => {
  const r = maxc({ age: 58, year: 2025, plans: ["hsa_self"] });
  assert.equal(r.contributions[0].max_employee_contribution, 5300);
});

test("F13 Roth catch-up 2026: 2025 FICA wages $150,001 -> must be Roth; $150,000 -> not", () => {
  assert.equal(maxc({ age: 52, year: 2026, plans: ["401k"], prior_year_fica_wages: 150001 }).roth_catch_up.must_be_roth, true);
  assert.equal(maxc({ age: 52, year: 2026, plans: ["401k"], prior_year_fica_wages: 150000 }).roth_catch_up.must_be_roth, false);
});

test("F14 401(k) and 403(b) together share one limit: age 40 2026 = 24,500", () => {
  const r = maxc({ age: 40, year: 2026, plans: ["401k", "403b"] });
  assert.equal(r.total_max_employee_contributions, 24500);
});

test("F15 deferral capped at wages: age 30, wages 18,000 -> 18,000", () => {
  assert.equal(maxc({ age: 30, year: 2026, plans: ["401k"], wages: 18000 }).contributions[0].max_employee_contribution, 18000);
});

test("F16 2027 401(k) request errors with not-published, 2027 HSA works", () => {
  assert.throws(() => maxc({ age: 45, year: 2027, plans: ["401k"] }), InputError);
  assert.equal(maxc({ age: 45, year: 2027, plans: ["hsa_family"] }).total_max_employee_contributions, 9000);
});

test("F17 SSA 2027 notice: COLA 3.6%, wage base $192,300, earnings test $2,130 x 12 = $25,560 and $5,660 x 12 = $67,920", () => {
  const r = ss({ year: 2027 });
  assert.equal(r.cola_percent, 3.6);
  assert.equal(r.wage_base, 192300);
  assert.equal(r.earnings_test.under_full_retirement_age.annual, 25560);
  assert.equal(r.earnings_test.year_reaching_full_retirement_age.annual, 67920);
  assert.equal(r.quarter_of_coverage, 1970);
});

test("F18 SSA 2026 and 2025 notices: COLA 2.8% / $184,500 and 2.5% / $176,100", () => {
  assert.equal(ss({ year: 2026 }).wage_base, 184500);
  assert.equal(ss({ year: 2026 }).cola_percent, 2.8);
  assert.equal(ss({ year: 2025 }).wage_base, 176100);
  assert.equal(ss({ year: 2025 }).cola_percent, 2.5);
});

test("F19 compare 2026 -> 2027: wage base +7,800, HSA family +250, 401(k) 2027 null", () => {
  const r = cmp({ from_year: 2026, to_year: 2027 });
  const row = (n) => r.rows.find((x) => x.item === n);
  assert.equal(row("Social Security wage base").change, 7800);
  assert.equal(row("HSA family").change, 250);
  assert.equal(row("401(k)/403(b)/TSP elective deferral").to, null);
  assert.ok(r.not_published);
});

test("F20 compare 2025 -> 2026: 401(k) +1,000, IRA +500, SIMPLE catch-up +500", () => {
  const r = cmp({ from_year: 2025, to_year: 2026 });
  const row = (n) => r.rows.find((x) => x.item === n);
  assert.equal(row("401(k)/403(b)/TSP elective deferral").change, 1000);
  assert.equal(row("IRA limit").change, 500);
  assert.equal(row("SIMPLE catch-up age 50+").change, 500);
});

test("F21 bad year errors", () => {
  assert.throws(() => limits({ year: 2028 }), InputError);
});
