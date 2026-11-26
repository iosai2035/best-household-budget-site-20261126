// Hearth & Ledger — the budgeting guide for repository iosai2035/best-household-budget-site-20261126.
// The methods this site teaches, in the site's own words, checked against the
// sources they come from: the 50/30/20 rule (Warren & Tyagi, "All Your Worth",
// 2005), the envelope method, the four rules of zero-based budgeting (give
// every dollar a job, embrace your true expenses, roll with the punches, age
// your money), and the two debt-payoff orders the Consumer Financial
// Protection Bureau describes (highest interest rate first, smallest balance
// first). No invented rules, no made-up figures: every number here is the
// method's own number, or this household's own month — the worked month at
// the end walks through the November 2026 figures the site itself shows, so
// the reader can check every line of it against the dashboard.
//
// A section is a title, its source, paragraphs of body text, and optionally
// a small table (headers plus rows of plain text) for figures that read
// better in columns than in a sentence.

export const GUIDE_SECTIONS = [
  {
    id: 'fifty-thirty-twenty',
    title: 'The 50/30/20 rule',
    source: 'Elizabeth Warren and Amelia Warren Tyagi, All Your Worth (2005)',
    body: [
      'Split your after-tax income — the money that actually lands in your account — into three shares. At most 50% goes to needs: housing, groceries, utilities, transport, insurance, minimum debt payments and childcare. At most 30% goes to wants: dining out, entertainment, subscriptions, hobbies and gifts. At least 20% goes to savings and extra debt payments: your emergency fund, retirement and paying loans down faster than the minimum. Minimum payments count as needs; any payment above the minimum counts as savings.',
      'It is a guideline, not a law. A household in an expensive city may run 60% needs, and that is fine — the rule is a starting point to measure against, and the planner on this site shows your own split next to the 50/30/20 targets so you can see the gap in dollars.',
      'Worked example: on $4,000 of take-home pay a month, the targets are $2,000 for needs, $1,200 for wants and $800 for savings. On $3,000 they are $1,500, $900 and $600.',
    ],
  },
  {
    id: 'zero-based',
    title: 'Zero-based budgeting: give every dollar a job',
    source: 'The four rules of You Need a Budget (YNAB)',
    body: [
      'Budget only the money you already have, and assign every dollar of it to a named category before you spend it — rent, groceries, the car, the holiday — until nothing is left unassigned. There is no "miscellaneous" and no spare money, only money already committed.',
      'When a category runs over, do not abandon the month: move money from another category and carry on. That trade-off is the whole point — you chose what matters more, instead of pretending the overspend did not happen.',
      'The other two rules complete it. Embrace your true expenses: the annual insurance premium, the car tyres and the December that always costs double get divided by twelve and set aside monthly, so they stop arriving as emergencies. Age your money: work toward spending money you earned at least a month ago, so this month runs on last month’s income and a late payday cannot break it.',
    ],
  },
  {
    id: 'envelopes',
    title: 'Envelope budgeting',
    source: 'The cash-envelope method, in its digital form',
    body: [
      'Give each flexible spending category its own envelope with a fixed amount for the month: groceries, dining out, transport, entertainment, clothing. Spend only from that envelope, and when it is empty, spending in that category stops until next month — unless you deliberately move money from another envelope and accept the trade-off.',
      'Fixed bills (rent, insurance, loan minimums) stay in the bank and are paid electronically; envelopes are for the spending that varies and is easiest to overshoot. Five to eight envelopes are easier to keep than twenty.',
      'This site’s budget page is the digital version: each category is an envelope with a planned amount, a spent amount and what is left, and the bar turns red the moment an envelope is over.',
    ],
  },
  {
    id: 'emergency-fund',
    title: 'The emergency fund: three to six months',
    source: 'The standard guideline for an emergency fund',
    body: [
      'An emergency fund covers essential spending when income stops: three to six months of needs is the usual guideline. Start with one month, then build to three, then six.',
      'Count only needs — housing, groceries, utilities, transport, insurance, minimum payments — not wants. For this household, one month of needs is $2,865, so three months is $8,595, which the emergency-fund goal rounds to $8,600.',
      'Keep it in a separate account you can reach in a day, and refill it first after any withdrawal. A fund that covers one month already changes how a broken car feels.',
    ],
  },
  {
    id: 'pay-yourself-first',
    title: 'Pay yourself first',
    source: 'The order the planner on this site follows',
    body: [
      'Move the savings out on payday, before the spending starts: the emergency fund, the goals and any extra debt payment leave the account the day the pay lands. What is left is what the month runs on, and the envelopes cannot accidentally spend the savings.',
      'That is why the budget on this site lists savings as a planned share of income, not as whatever happens to be left at the end of the month. The 20% share of the 50/30/20 rule is the same idea: savings is a bill you pay to your future self, first.',
    ],
  },
  {
    id: 'paying-off-debt',
    title: 'Paying off debt: highest rate first, or smallest first',
    source: 'Consumer Financial Protection Bureau, "How to reduce your debt"',
    body: [
      'Both methods run the same engine. Keep paying the minimum on every debt, so none of them falls behind. Then take every spare dollar — the extra payment the 50/30/20 rule counts as savings — and aim it at one debt only. When that debt reaches zero, the whole payment you were making on it rolls onto the next debt in line, so the monthly amount you pay never shrinks; it just concentrates.',
      'The highest-interest-rate method aims the extra at the debt with the highest rate first, because that is the debt costing the most. The Bureau says this method can save money in the long run, and to use it if saving the most is what motivates you. Its cost is patience: when the highest-rate debt is also a large one, the first payoff can take a while to arrive.',
      'The snowball method aims the extra at the smallest balance first, whatever its rate. The Bureau says you see progress sooner this way — a debt disappears early, which keeps some households going — but you may end up paying more in the long run, because the expensive debts wait their turn. Pick the one you will actually finish: the method you stick with beats the one that looks best on paper. Either way, the extra payment is a planned share of the budget, not whatever is left at the end of the month.',
    ],
  },
  {
    id: 'worked-month',
    title: 'A worked month: the Alvarez household, November 2026',
    source: 'This site’s own sample month — every figure below is on the dashboard',
    body: [
      'Payday, November 1: the $3,900 salary lands, and the savings leave the same day — $420 to the emergency fund, $200 to the vacation, $240 to the new car and $260 to retirement, $1,120 in all. Rent ($1,250) and the first half of childcare ($175) go out the same day, so the month starts with its fixed costs and its savings already settled.',
      'Through the month, the envelopes do the work: six weekly supermarket shops add up to $459.50 of a $480 grocery envelope, fuel and the bus pass to $177.25 of $230 for transport, and the utilities — electricity, water and gas — to $176.55 of $190. The heaviest week is the first, $1,986.03, because rent, childcare and the savings transfers all land in it.',
      'By November 24 the month reads like this: $4,800 came in and $4,670 of it was planned — $2,865 needs, $685 wants, $1,120 savings — leaving $130 never assigned. Of the plan, $3,124.56 was spent ($2,747.90 needs, $376.66 wants) and the $1,120 was saved, so $555.44 of the income is still unspent. Needs run $465 over the 50% guide, which is what the extra savings are paid for with: wants sit $755 under their 30% target.',
      'The emergency fund ends the month at $3,200 of its $8,600 target — 37% there, covering 1.1 months of needs, with about 13 months left at $420 a month. Read the month this way and the budget stops being a list of numbers: it is the story of where the pay went, in order.',
      'One loose end is worth closing: the $130 that was never assigned. Give it to the emergency fund and the monthly contribution becomes $550; the $5,400 still to save then takes 10 months instead of 13. That is the whole method in one move — unassigned money is a job waiting to be given, and the job with the clearest finish date is the one to take it.',
    ],
    table: {
      headers: ['Line', 'Amount'],
      rows: [
        ['Income (salary $3,900 + freelance $900)', '$4,800.00'],
        ['Planned: needs $2,865 + wants $685 + savings $1,120', '$4,670.00'],
        ['Never assigned', '$130.00'],
        ['Spent: needs $2,747.90 + wants $376.66', '$3,124.56'],
        ['Saved', '$1,120.00'],
        ['Income not yet spent', '$555.44'],
      ],
    },
  },
];
