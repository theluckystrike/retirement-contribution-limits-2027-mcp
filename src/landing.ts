// GET / page for the hosted Worker.
const TOOLS: Array<[string, string]> = [
  ["get_contribution_limits", "401(k), 403(b), 457(b), TSP, SIMPLE, IRA, HSA and 415(c) limits, catch-ups, compensation and HCE thresholds for 2025, 2026 and 2027 (2027 HSA: $4,500 / $9,000)."],
  ["calculate_max_contribution", "Most you can contribute by age, year and plans, with the age 60-63 super catch-up, the HSA 55+ catch-up and the Roth catch-up wage test."],
  ["get_social_security_cola", "Social Security COLA (3.6% for 2027), wage base ($192,300 for 2027), earnings test limits, quarter of coverage and SSI amounts."],
  ["compare_years", "Side-by-side change in every limit between two years, with unpublished 2027 figures shown as not published."],
];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function landingPage(origin: string): string {
  const mcp = `${origin}/mcp`;
  const rows = TOOLS.map(([n, d]) => `<tr><td><code>${n}</code></td><td>${esc(d)}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Retirement Contribution Limits MCP</title>
<meta name="description" content="MCP server for 401(k), IRA and HSA contribution limits, the age 60-63 super catch-up, the Roth catch-up rule and the 2027 Social Security COLA and wage base.">
<style>:root{--bg:#fff;--fg:#1a1a1a;--muted:#555;--line:#ddd;--code:#f4f4f4}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#eee;--muted:#aaa;--line:#333;--code:#222}}
body{background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif;max-width:760px;margin:0 auto;padding:24px 16px}
code,pre{background:var(--code);border-radius:4px;font-size:14px}pre{padding:10px;overflow-x:auto}code{padding:1px 4px}
table{border-collapse:collapse;width:100%}td{border-top:1px solid var(--line);padding:8px 6px;vertical-align:top}p.small{color:var(--muted);font-size:14px}a{color:inherit}</style></head>
<body><h1>Retirement Contribution Limits MCP server</h1>
<p>Gives an AI assistant the official 2025, 2026 and 2027 retirement numbers that are newer than its training data: 401(k), IRA, SIMPLE and HSA limits, the SECURE 2.0 age 60-63 catch-up and Roth catch-up rule, and the Social Security COLA, wage base and earnings test. Every figure is copied from irs.gov or SSA's Federal Register notice. Limits the IRS has not announced yet are reported as not published, never guessed.</p>
<h2>Connect</h2>
<p>Hosted endpoint (Streamable HTTP, no sign-in, no token). Paste it into Claude.ai custom connectors or ChatGPT developer mode.</p>
<pre>${esc(mcp)}</pre>
<p>Claude Code</p><pre>claude mcp add --transport http retirement-limits ${esc(mcp)}</pre>
<p>Local (stdio)</p><pre>npx -y github:theluckystrike/retirement-contribution-limits-2027-mcp</pre>
<h2>Tools</h2><table>${rows}</table>
<p>Paycheck calculators for people: <a href="https://statewage.com/401k-paycheck-calculator/?utm_source=mcp&amp;utm_medium=retirement-contribution-limits-2027-mcp">statewage.com</a>.
Source: <a href="https://github.com/theluckystrike/retirement-contribution-limits-2027-mcp">github.com/theluckystrike/retirement-contribution-limits-2027-mcp</a>.</p>
<p class="small">General information, not tax advice. Part of the Zovo MCP collection: <a href="https://mcp.zovo.one">mcp.zovo.one</a>.</p>
</body></html>`;
}
