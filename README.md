# retirement-contribution-limits-2027-mcp

An MCP server that gives an AI assistant the official 401(k), 403(b), 457(b), IRA, SIMPLE and HSA contribution limits for 2025, 2026 and 2027, the SECURE 2.0 age 60-63 super catch-up and Roth catch-up rule, and the 2027 Social Security COLA, wage base and earnings test. Limits the IRS has not announced yet are reported as not published, never guessed.

Hosted endpoint, no sign-in and no token:

```
https://retirement-contribution-limits-2027-mcp.lipmichal.workers.dev/mcp
```

## Tools

| Tool | What it does |
|---|---|
| `get_contribution_limits` | 401(k)/403(b)/TSP and 457(b) deferral, age 50+ catch-up, age 60-63 super catch-up, IRA and IRA catch-up, SIMPLE, 415(c) total, 401(a)(17) compensation limit, HCE threshold, Roth IRA phase-outs, HSA self/family, and the Social Security wage base, by year and account. |
| `calculate_max_contribution` | The most one person can put in for a year from age, plans held and wages. Applies the right catch-up tier, the shared 402(g) limit, the separate 457(b) limit, the HSA 55+ catch-up, the compensation cap and the Roth catch-up wage test. |
| `get_social_security_cola` | COLA, taxable maximum (wage base), retirement earnings test limits, quarter of coverage, SGA and SSI amounts for 2025, 2026 and 2027. |
| `compare_years` | Every figure for two years side by side with the dollar and percent change. |

Every result has structured JSON, a plain-English summary, `as_of`, `source` (the irs.gov or SSA document) and `more` (a paycheck calculator on statewage.com).

## What it knows that your model does not

- 2026 limits (IRS Notice 2025-67): 401(k) $24,500, catch-up $8,000, age 60-63 catch-up $11,250, IRA $7,500 plus $1,100 at 50+, 415(c) $72,000, compensation limit $360,000.
- 2027 HSA limits (Rev. Proc. 2026-24): $4,500 self-only and $9,000 family, plus the $1,000 catch-up at 55.
- 2027 Social Security (SSA notice, Federal Register Oct. 26, 2026): COLA 3.6%, wage base $192,300, earnings test $25,560 under full retirement age and $67,920 in the year you reach it.
- The age 60-63 catch-up applies only if you are 60, 61, 62 or 63 on December 31. At 64 you drop back to the regular catch-up.
- Roth catch-up rule: from 2026, if your prior-year FICA wages from the employer were over $150,000, catch-ups must be Roth. The final regulations apply from 2027 (IR-2025-91).
- The IRS had not announced the 2027 401(k), IRA or SIMPLE limits on 2026-11-02. The tools say so and point to 2026.

## Install

### Claude.ai custom connector or ChatGPT developer mode

Add a custom connector and paste the URL. No token is needed.

```
https://retirement-contribution-limits-2027-mcp.lipmichal.workers.dev/mcp
```

### Claude Code

```
claude mcp add --transport http retirement-limits https://retirement-contribution-limits-2027-mcp.lipmichal.workers.dev/mcp
```

Or run it locally:

```
claude mcp add retirement-limits -- npx -y github:theluckystrike/retirement-contribution-limits-2027-mcp
```

### Claude Desktop

Add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "retirement-limits": {
      "command": "npx",
      "args": ["-y", "github:theluckystrike/retirement-contribution-limits-2027-mcp"]
    }
  }
}
```

### Cursor

Add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "retirement-limits": {
      "url": "https://retirement-contribution-limits-2027-mcp.lipmichal.workers.dev/mcp"
    }
  }
}
```

### VS Code

Add this to `.vscode/mcp.json`:

```json
{
  "servers": {
    "retirement-limits": {
      "type": "http",
      "url": "https://retirement-contribution-limits-2027-mcp.lipmichal.workers.dev/mcp"
    }
  }
}
```

Node 20 or newer is needed for the local `npx` version.

## Example prompts

- "What is the 401k limit for 2026, and has the IRS announced 2027 yet?"
- "I turn 61 this year and have a 401(k), an IRA and a family HSA. What is the most I can contribute in 2026?"
- "I earned $180,000 in FICA wages last year. Do my 2026 catch-up contributions have to be Roth?"
- "What is the Social Security COLA for 2027 and the new wage base?"
- "How much can I earn in 2027 before Social Security withholds benefits if I am 64?"
- "Compare the HSA limits for 2026 and 2027."

## Data sources

Every figure comes from irs.gov or SSA's official Federal Register notice, fetched on 2026-11-02: IRS Notices 2024-80 and 2025-67, Rev. Procs. 2024-25, 2025-19 and 2026-24, Pub. 969, IR-2025-91, and SSA's "Cost-of-Living Increase and Other Determinations" notices for 2025, 2026 and 2027. See [DATA_SOURCES.md](DATA_SOURCES.md).

## Limitations

- General information, not tax advice. Your plan can be stricter than the law (many plans do not offer the age 60-63 catch-up).
- 2027 401(k), IRA, SIMPLE, 415(c) and HCE limits were not published on 2026-11-02. They will be added when the IRS announces them.
- Not covered: the 403(b) 15-year catch-up, the 457(b) final-three-years catch-up, employer contribution formulas, IRA deduction phase-outs and Roth IRA partial-contribution math.
- The maximum Social Security benefit at full retirement age is left out: it is on SSA's fact sheet, which could not be fetched from this build host.

## More

Paycheck calculators for people: [401(k) paycheck calculator](https://statewage.com/401k-paycheck-calculator/?utm_source=mcp&utm_medium=retirement-contribution-limits-2027-mcp), [HSA paycheck calculator](https://statewage.com/hsa-paycheck-calculator/?utm_source=mcp&utm_medium=retirement-contribution-limits-2027-mcp) and [Social Security tax calculator](https://statewage.com/social-security-tax-calculator/?utm_source=mcp&utm_medium=retirement-contribution-limits-2027-mcp) on statewage.com.

Part of the Zovo MCP collection: https://mcp.zovo.one

## Development

```
npm install
npm run build
npm test
```

`src/core.ts` holds all the figures and rules and has no I/O. `src/stdio.ts` is the local entry and `src/worker.ts` is the Cloudflare Worker entry. Both use the same tool registry in `src/tools.ts`.

## License

MIT

<!-- data-servers:start -->
## More data servers from the same author

Each one is free, needs no API key and has a hosted URL you can paste into Claude or ChatGPT.

| server | tools | hosted URL |
|---|---|---|
| [cups-to-grams-mcp](https://github.com/theluckystrike/cups-to-grams-mcp) | convert_ingredient, search_ingredients, scale_recipe, convert_oven_temperature | `https://cups-to-grams-mcp.lipmichal.workers.dev/mcp` |
| [dscr-loan-calculator-mcp](https://github.com/theluckystrike/dscr-loan-calculator-mcp) | calculate_dscr, max_loan_for_target_dscr, rent_needed_for_target_dscr, compare_scenarios, amortization_summary | `https://dscr-loan-calculator-mcp.lipmichal.workers.dev/mcp` |
| [gold-price-per-gram-mcp](https://github.com/theluckystrike/gold-price-per-gram-mcp) | get_gold_price_per_gram, get_metal_prices, calculate_jewelry_value, convert_gold_units | `https://gold-price-per-gram-mcp.lipmichal.workers.dev/mcp` |
| [lake-level-mcp](https://github.com/theluckystrike/lake-level-mcp) | search_lakes, get_lake_level, get_lake_history, compare_lakes | `https://lake-level-mcp.lipmichal.workers.dev/mcp` |
| [minimum-wage-mcp](https://github.com/theluckystrike/minimum-wage-mcp) | get_minimum_wage, list_upcoming_increases, compare_states, annual_income_at_minimum_wage | `https://minimum-wage-mcp.lipmichal.workers.dev/mcp` |
| [no-tax-on-overtime-mcp](https://github.com/theluckystrike/no-tax-on-overtime-mcp) | calculate_overtime_deduction, calculate_tips_deduction, calculate_senior_deduction, estimate_tax_savings, explain_eligibility | `https://no-tax-on-overtime-mcp.lipmichal.workers.dev/mcp` |
| [paycheck-calculator-mcp](https://github.com/theluckystrike/paycheck-calculator-mcp) | calculate_take_home_pay, compare_states_take_home, salary_to_hourly, hourly_to_salary, get_federal_tax_brackets | `https://paycheck-calculator-mcp.lipmichal.workers.dev/mcp` |
| [uk-income-tax-salary-mcp](https://github.com/theluckystrike/uk-income-tax-salary-mcp) | calculate_uk_take_home, get_uk_tax_bands, compare_salaries, marginal_rate_at_income | `https://uk-income-tax-salary-mcp.lipmichal.workers.dev/mcp` |
| [us-federal-holidays-business-days-mcp](https://github.com/theluckystrike/us-federal-holidays-business-days-mcp) | list_federal_holidays, is_business_day, add_business_days, count_business_days, invoice_due_date | `https://us-federal-holidays-business-days-mcp.lipmichal.workers.dev/mcp` |
| [ab-test-sample-size-calculator-mcp](https://github.com/theluckystrike/ab-test-sample-size-calculator-mcp) | calculate_sample_size, estimate_test_duration, test_ab_significance, fisher_exact_test, check_peeking_risk | `https://ab-test-sample-size-calculator-mcp.lipmichal.workers.dev/mcp` |
| [aca-premium-tax-credit-calculator-mcp](https://github.com/theluckystrike/aca-premium-tax-credit-calculator-mcp) | get_federal_poverty_level, calculate_premium_tax_credit, check_subsidy_cliff, get_aptc_repayment_cap | `https://aca-premium-tax-credit-calculator-mcp.lipmichal.workers.dev/mcp` |
| [ap-score-distributions-mcp](https://github.com/theluckystrike/ap-score-distributions-mcp) | get_ap_score_distribution, estimate_ap_percentile, compare_ap_exams, list_ap_exams, estimate_ap_score_from_composite | `https://ap-score-distributions-mcp.lipmichal.workers.dev/mcp` |
| [car-loan-interest-deduction-calculator-mcp](https://github.com/theluckystrike/car-loan-interest-deduction-calculator-mcp) | calculate_car_loan_interest_deduction, calculate_salt_deduction, get_tax_brackets_and_standard_deduction, calculate_child_tax_credit | `https://car-loan-interest-deduction-calculator-mcp.lipmichal.workers.dev/mcp` |
| [recipe-nutrition-calculator-mcp](https://github.com/theluckystrike/recipe-nutrition-calculator-mcp) | lookup_ingredient_nutrition, calculate_recipe_nutrition, round_nutrition_label, scale_recipe_nutrition | `https://recipe-nutrition-calculator-mcp.lipmichal.workers.dev/mcp` |
| [section-179-deduction-calculator-mcp](https://github.com/theluckystrike/section-179-deduction-calculator-mcp) | calculate_section_179, calculate_bonus_depreciation, get_vehicle_depreciation_limits, calculate_asset_loan_payment | `https://section-179-deduction-calculator-mcp.lipmichal.workers.dev/mcp` |
| [student-loan-repayment-assistance-plan-calculator-mcp](https://github.com/theluckystrike/student-loan-repayment-assistance-plan-calculator-mcp) | calculate_rap_payment, compare_rap_vs_standard, get_federal_loan_limits, get_plan_transition_dates | `https://student-loan-repayment-assistance-plan-calculator-mcp.lipmichal.workers.dev/mcp` |
| [subdomain-finder-mcp](https://github.com/theluckystrike/subdomain-finder-mcp) | find_subdomains, resolve_subdomains, get_certificate_history, summarize_attack_surface | `https://subdomain-finder-mcp.lipmichal.workers.dev/mcp` |

The paid back-office collection (invoices, VAT, PDFs, spreadsheets) is at https://mcp.zovo.one
<!-- data-servers:end -->
