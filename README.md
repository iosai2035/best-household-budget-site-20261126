# best-household-budget-site-20261126

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/iosai2035/best-household-budget-site-20261126/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/iosai2035/best-household-budget-site-20261126/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Hearth & Ledger — a household budget site that runs entirely in your browser. Income in, every dollar given a job, savings moved first: a dashboard with spending by category, a budget planner with the 50/30/20 rule and envelope tracking, transactions, savings goals with finish dates, and calculators for the 50/30/20 split, the emergency fund and goal dates. All offline, on desktop and on a phone; your data stays in your browser.

## What it does

- **Dashboard** — income, spending, savings and what is still unassigned, a donut of spending by category, envelopes running low, recurring bills and recent transactions.
- **Budget** — every category with a monthly plan you can edit, spent and left, against the 50/30/20 rule with the gap in dollars.
- **Transactions** — add, list and delete income and spending; search and filter the list; a weekly spending bar chart for the month; download the rows you see as a CSV file (RFC 4180, built in your browser — the data never leaves the device). Every total on the site updates at once.
- **Goals** — savings goals with a target, a monthly contribution and a finish date worked out from the numbers, plus an emergency-fund cover meter.
- **Planner** — a 50/30/20 calculator, an emergency-fund calculator (three to six months of needs), a what-if simulator that moves money between the three shares and shows the new split and the extra savings over a year, and a goal-date calculator.
- **Guide** — the methods in plain language, each with its source: 50/30/20, zero-based budgeting, envelopes, the emergency fund and pay-yourself-first.
- **Dark mode** — a toggle in the header that follows your system setting until you pick a side, and remembers the choice.

The sample data is one coherent month (November 2026) for a household taking home $4,800: $4,670 planned, $3,124.56 spent, $1,120 saved, $130 unassigned. Edit anything — it is saved in your browser only — or reset the demo data from the footer. All arithmetic is done in integer cents, so no total ever drifts by a cent.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080.

---

<sub>Entered on [make.fun](https://make.fun/?ref=57z043hx&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
