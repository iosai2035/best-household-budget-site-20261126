// Hearth & Ledger — the budgeting guide for repository iosai2035/best-household-budget-site.
// The methods this site teaches, in the site's own words, checked against the
// sources they come from: the 50/30/20 rule (Warren & Tyagi, "All Your Worth",
// 2005), the envelope method, and the four rules of zero-based budgeting
// (give every dollar a job, embrace your true expenses, roll with the punches,
// age your money). No invented rules, no made-up figures: every number here is
// the method's own number.

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
];
