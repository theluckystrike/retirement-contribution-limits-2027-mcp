# Data sources

Every figure in `src/core.ts` was copied from the documents below, fetched on 2026-11-02.

| Figures | Source | URL |
|---|---|---|
| 2026 plan limits: 402(g) $24,500, 457 $24,500, catch-up $8,000, age 60-63 $11,250, 415(c) $72,000, 415(b) $290,000, 401(a)(17) $360,000, HCE $160,000, key employee $235,000, SIMPLE $17,000 / $18,100, SIMPLE catch-up $4,000 / $3,850, SIMPLE 60-63 $5,250, IRA $7,500, IRA catch-up $1,100, Roth IRA phase-outs $153,000-$168,000 and $242,000-$252,000, Roth catch-up wage threshold $150,000 (2025 wages); 2025 values from the "increased from" text | IRS Notice 2025-67 | https://www.irs.gov/pub/irs-drop/n-25-67.pdf |
| 2026 limits news release (IR-2025-111) | IRS newsroom | https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500 |
| 2025 plan limits: 402(g) $23,500, catch-up $7,500, age 60-63 $11,250, 415(c) $70,000, 415(b) $280,000, 401(a)(17) $350,000, HCE $160,000, key employee $230,000, SIMPLE $16,500 / $17,600, SIMPLE catch-up $3,500 / $3,850, SIMPLE 60-63 $5,250, IRA $7,000 + $1,000, Roth IRA phase-outs $150,000-$165,000 and $236,000-$246,000, Roth catch-up threshold $145,000 (2024 wages) | IRS Notice 2024-80 | https://www.irs.gov/pub/irs-drop/n-24-80.pdf |
| 2027 plan limits: not published. IRS news release list checked through IR-2026-129 (Oct. 29, 2026) | IRS newsroom | https://www.irs.gov/newsroom/news-releases-for-current-month |
| 2027 HSA $4,500 / $9,000, HDHP minimum deductible $1,750 / $3,500, out-of-pocket max $8,700 / $17,400 | Rev. Proc. 2026-24 | https://www.irs.gov/pub/irs-drop/rp-26-24.pdf |
| 2026 HSA $4,400 / $8,750, HDHP $1,700 / $3,400, OOP $8,500 / $17,000 | Rev. Proc. 2025-19 | https://www.irs.gov/pub/irs-drop/rp-25-19.pdf |
| 2025 HSA $4,300 / $8,550, HDHP $1,650 / $3,300, OOP $8,300 / $16,600 | Rev. Proc. 2024-25 | https://www.irs.gov/pub/irs-drop/rp-24-25.pdf |
| HSA additional contribution $1,000 at age 55 | IRS Pub. 969 | https://www.irs.gov/pub/irs-pdf/p969.pdf |
| Roth catch-up rule: final regulations generally apply to taxable years beginning after Dec. 31, 2026; good-faith compliance before 2027; Notice 2023-62 transition ended Dec. 31, 2025 | IR-2025-91 (Sept. 15, 2025) | https://www.irs.gov/newsroom/treasury-irs-issue-final-regulations-on-new-roth-catch-up-rule-other-secure-2point0-act-provisions |
| 2027 Social Security: COLA 3.6%, wage base $192,300, earnings test $2,130 / $5,660 a month (annual = 12x), quarter of coverage $1,970, SGA $1,770 / $2,950, SSI $1,029 / $1,544 | SSA, Federal Register doc. 2026-21796 (Oct. 26, 2026) | https://www.federalregister.gov/documents/2026/10/26/2026-21796/cost-of-living-increase-and-other-determinations-for-2027 |
| 2026 Social Security: COLA 2.8%, wage base $184,500, earnings test $2,040 / $5,430, QC $1,890, SGA $1,690 / $2,830, SSI $994 / $1,491 | SSA, Federal Register doc. 2025-19763 (Nov. 3, 2025) | https://www.federalregister.gov/documents/2025/11/03/2025-19763/cost-of-living-increase-and-other-determinations-for-2026 |
| 2025 Social Security: COLA 2.5%, wage base $176,100, earnings test $1,950 / $5,180, QC $1,810, SSI $967 / $1,450 | SSA, Federal Register doc. 2024-24871 (Oct. 25, 2024) | https://www.federalregister.gov/documents/2024/10/25/2024-24871/cost-of-living-increase-and-other-determinations-for-2025 |

## Notes

- ssa.gov (www.ssa.gov/cola, the COLA fact sheet PDFs and /oact/cola pages) returned HTTP 403 to this build host and to a Cloudflare Worker on 2026-11-02. SSA's own annual notice in the Federal Register carries the same determinations and was used instead. The maximum benefit at full retirement age is only on the fact sheet, so it is not included.
- When the IRS publishes the 2027 cost-of-living notice, add a 2027 entry to `PLAN_LIMITS` in `src/core.ts` and the Roth catch-up threshold for 2027.
