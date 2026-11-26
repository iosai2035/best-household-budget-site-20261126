// Hearth & Ledger — demo household data for repository iosai2035/best-household-budget-site-20261126.
// Every amount is an integer number of US cents, so the budget arithmetic never
// touches floating point. The figures below are one coherent sample month
// (November 2026) for the Alvarez household: income $4,800, budgets $4,670,
// savings $1,120, spending $3,124.56, and $130 left unassigned — the app
// computes every total from these rows, so the numbers on screen always agree
// with the data. Edit anything in the app; "Reset demo data" restores this file.
//
// The rows below are written as compact tables — one short array per record —
// and turned into the objects the app uses by the small builder functions at
// the top. That keeps the figures easy to audit in columns (a wrong digit
// stands out in a table) while the rest of the app keeps working with named
// fields. A consistency check runs when this module loads: it proves the
// income rows add up to the household income, every transaction names a real
// category and falls inside the month, and no goal is already over its target.
// If any of those ever fails, the module refuses to load rather than showing
// a budget built on broken data.

export const HOUSEHOLD = {
  name: 'The Alvarez household',
  month: 'November 2026',
  // Monthly after-tax (take-home) income, in cents. Must equal the sum of
  // the income rows below; checkSeed() below enforces that.
  incomeCents: 480000,
};

// One row of a table: [id, name, kind, budgetCents, fixed, dueDay].
// kind is one of 'need', 'want' or 'saving', the three shares of the
// 50/30/20 rule. budgetCents is the monthly plan for the category. fixed
// marks a bill that arrives on the same day each month, with its due day.
function categoryFromRow([id, name, kind, budgetCents, fixed, dueDay]) {
  return { id, name, kind, budgetCents, fixed, dueDay: fixed ? dueDay : null };
}

export const CATEGORIES = [
  ['housing', 'Housing', 'need', 125000, true, 1],
  ['groceries', 'Groceries', 'need', 48000, false, null],
  ['utilities', 'Utilities', 'need', 19000, false, null],
  ['transport', 'Transport', 'need', 23000, false, null],
  ['insurance', 'Insurance', 'need', 16000, true, 5],
  ['phone', 'Phone & internet', 'need', 9500, true, 8],
  ['health', 'Healthcare', 'need', 11000, false, null],
  ['childcare', 'Childcare', 'need', 35000, true, 1],
  ['dining', 'Dining out', 'want', 22000, false, null],
  ['entertainment', 'Entertainment', 'want', 14000, false, null],
  ['subscriptions', 'Subscriptions', 'want', 5500, true, 2],
  ['clothing', 'Clothing', 'want', 11000, false, null],
  ['hobbies', 'Hobbies', 'want', 9000, false, null],
  ['gifts', 'Gifts', 'want', 7000, false, null],
  ['emergency', 'Emergency fund', 'saving', 42000, true, 1],
  ['vacation', 'Family vacation', 'saving', 20000, true, 1],
  ['car', 'New car', 'saving', 24000, true, 1],
  ['retirement', 'Retirement', 'saving', 26000, true, 1],
].map(categoryFromRow);

// One row of a table: [id, date, source, amountCents]. Positive amounts are
// money in; the household's income is the salary plus the two freelance jobs.
function incomeFromRow([id, date, source, amountCents]) {
  return { id, date, source, amountCents };
}

export const INCOME = [
  ['inc-salary', '2026-11-01', 'Salary — Alvarez household', 390000],
  ['inc-free-1', '2026-11-07', 'Freelance — design work', 45000],
  ['inc-free-2', '2026-11-14', 'Freelance — design work', 45000],
].map(incomeFromRow);

// One row of a table: [id, date, description, categoryId, amountCents].
// amountCents is negative for money out, positive for money in. A transaction
// whose category is a 'saving' kind is a transfer to savings, not spending:
// the app counts it under "saved", never under "spent". The rows are grouped
// by week so the weekly trend on the transactions page can be read off them:
// week 1 (Nov 1–7) carries the rent, the childcare halves and the savings
// transfers; week 4 (Nov 22–30) is the quiet end of the month.
function transactionFromRow([id, date, description, categoryId, amountCents]) {
  return { id, date, description, categoryId, amountCents };
}

export const TRANSACTIONS = [
  // Week 1 — Nov 1–7.
  ['t01', '2026-11-01', 'Rent — November', 'housing', -125000],
  ['t02', '2026-11-01', 'Childcare — first half', 'childcare', -17500],
  ['t03', '2026-11-01', 'Emergency fund transfer', 'emergency', -42000],
  ['t04', '2026-11-01', 'Vacation fund transfer', 'vacation', -20000],
  ['t05', '2026-11-01', 'New car fund transfer', 'car', -24000],
  ['t06', '2026-11-01', 'Retirement contribution', 'retirement', -26000],
  ['t07', '2026-11-02', 'Supermarket — weekly shop', 'groceries', -8240],
  ['t08', '2026-11-02', 'Music streaming', 'subscriptions', -1099],
  ['t09', '2026-11-03', 'Fuel', 'transport', -4200],
  ['t10', '2026-11-04', 'Electricity bill', 'utilities', -9620],
  ['t11', '2026-11-05', 'Car insurance — monthly', 'insurance', -16000],
  ['t12', '2026-11-05', 'Video streaming', 'subscriptions', -1499],
  ['t13', '2026-11-06', 'Supermarket — weekly shop', 'groceries', -7115],
  ['t14', '2026-11-06', 'Birthday gift', 'gifts', -3500],
  ['t15', '2026-11-07', 'Restaurant — family dinner', 'dining', -4830],
  // Week 2 — Nov 8–14.
  ['t16', '2026-11-08', 'Internet', 'phone', -5500],
  ['t17', '2026-11-08', 'Mobile phone', 'phone', -4000],
  ['t18', '2026-11-09', 'Supermarket — weekly shop', 'groceries', -8830],
  ['t19', '2026-11-09', 'Cinema tickets', 'entertainment', -2800],
  ['t20', '2026-11-10', 'Fuel', 'transport', -3850],
  ['t21', '2026-11-10', 'Books', 'hobbies', -2450],
  ['t22', '2026-11-11', 'Water bill', 'utilities', -4175],
  ['t23', '2026-11-12', 'Pharmacy', 'health', -3460],
  ['t24', '2026-11-12', 'Cloud storage', 'subscriptions', -999],
  ['t25', '2026-11-13', 'Supermarket — weekly shop', 'groceries', -6490],
  ['t26', '2026-11-14', 'Takeout', 'dining', -3275],
  // Week 3 — Nov 15–21.
  ['t27', '2026-11-15', 'Childcare — second half', 'childcare', -17500],
  ['t28', '2026-11-15', 'Gas bill', 'utilities', -3860],
  ['t29', '2026-11-16', 'Supermarket — weekly shop', 'groceries', -7925],
  ['t30', '2026-11-16', 'Concert tickets', 'entertainment', -6500],
  ['t31', '2026-11-17', 'Fuel', 'transport', -4475],
  ['t32', '2026-11-18', "Kids' shoes", 'clothing', -6200],
  ['t33', '2026-11-19', 'Dentist copay', 'health', -4500],
  ['t34', '2026-11-20', 'Supermarket — weekly shop', 'groceries', -7350],
  ['t35', '2026-11-20', 'News subscription', 'subscriptions', -799],
  ['t36', '2026-11-21', 'Cafe', 'dining', -1840],
  // Week 4 — Nov 22–30.
  ['t37', '2026-11-24', 'Bus pass', 'transport', -5200],
  ['t38', '2026-11-24', 'Craft supplies', 'hobbies', -1875],
].map(transactionFromRow);

// One row of a table: [id, name, note, targetCents, savedCents, monthlyCents].
// savedCents is the balance already set aside (built over past months, not
// only this month's transfers). targetCents is the goal; monthlyCents is the
// planned monthly contribution. The app works out the months left and the
// finish date from these three numbers.
function goalFromRow([id, name, note, targetCents, savedCents, monthlyCents]) {
  return { id, name, note, targetCents, savedCents, monthlyCents };
}

export const GOALS = [
  [
    'goal-emergency',
    'Emergency fund',
    'Three months of essential spending ($2,865 × 3 = $8,595, rounded to $8,600)',
    860000,
    320000,
    42000,
  ],
  ['goal-vacation', 'Family vacation', 'A week away next summer', 180000, 64000, 20000],
  ['goal-car', 'New car down payment', 'For the car we will need next year', 400000, 115000, 24000],
].map(goalFromRow);

// The seed data must agree with itself before the app ever shows it. The
// income rows must add up to the household's stated income; every id must be
// unique inside its own table, so a lookup by id can never find the wrong
// row; every transaction must name a category that exists and fall inside
// November 2026; every goal must have a positive target and a saved balance
// no larger than it. A broken row throws here, at load time, instead of
// silently showing wrong totals.
function checkSeed() {
  const incomeTotal = INCOME.reduce((total, row) => total + row.amountCents, 0);
  if (incomeTotal !== HOUSEHOLD.incomeCents) {
    throw new Error(`seed income ${incomeTotal} does not match household income ${HOUSEHOLD.incomeCents}`);
  }
  for (const [label, rows] of [
    ['category', CATEGORIES],
    ['income', INCOME],
    ['transaction', TRANSACTIONS],
    ['goal', GOALS],
  ]) {
    const seen = new Set();
    for (const row of rows) {
      if (seen.has(row.id)) throw new Error(`duplicate seed ${label} id: ${row.id}`);
      seen.add(row.id);
    }
  }
  const categoryIds = new Set(CATEGORIES.map((c) => c.id));
  for (const t of TRANSACTIONS) {
    if (!categoryIds.has(t.categoryId)) {
      throw new Error(`seed transaction ${t.id} names unknown category ${t.categoryId}`);
    }
    if (!/^2026-11-(0[1-9]|[12][0-9]|30)$/.test(t.date)) {
      throw new Error(`seed transaction ${t.id} falls outside November 2026: ${t.date}`);
    }
  }
  for (const g of GOALS) {
    if (g.targetCents <= 0 || g.savedCents < 0 || g.savedCents > g.targetCents) {
      throw new Error(`seed goal ${g.id} has an impossible saved/target pair`);
    }
  }
}

checkSeed();
