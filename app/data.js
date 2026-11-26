// Hearth & Ledger — demo household data for repository iosai2035/best-household-budget-site.
// Every amount is an integer number of US cents, so the budget arithmetic never
// touches floating point. The figures below are one coherent sample month
// (November 2026) for the Alvarez household: income $4,800, budgets $4,670,
// savings $1,120, spending $3,124.56, and $130 left unassigned — the app
// computes every total from these rows, so the numbers on screen always agree
// with the data. Edit anything in the app; "Reset demo data" restores this file.

export const HOUSEHOLD = {
  name: 'The Alvarez household',
  month: 'November 2026',
  // Monthly after-tax (take-home) income, in cents.
  incomeCents: 480000,
};

export const INCOME = [
  { id: 'inc-salary', date: '2026-11-01', source: 'Salary — Alvarez household', amountCents: 390000 },
  { id: 'inc-free-1', date: '2026-11-07', source: 'Freelance — design work', amountCents: 45000 },
  { id: 'inc-free-2', date: '2026-11-14', source: 'Freelance — design work', amountCents: 45000 },
];

// Categories. kind is one of 'need', 'want' or 'saving', the three shares of the
// 50/30/20 rule. budgetCents is the monthly plan for the category. fixed marks
// a bill that arrives on the same day each month, with its due day.
export const CATEGORIES = [
  { id: 'housing', name: 'Housing', kind: 'need', budgetCents: 125000, fixed: true, dueDay: 1 },
  { id: 'groceries', name: 'Groceries', kind: 'need', budgetCents: 48000, fixed: false, dueDay: null },
  { id: 'utilities', name: 'Utilities', kind: 'need', budgetCents: 19000, fixed: false, dueDay: null },
  { id: 'transport', name: 'Transport', kind: 'need', budgetCents: 23000, fixed: false, dueDay: null },
  { id: 'insurance', name: 'Insurance', kind: 'need', budgetCents: 16000, fixed: true, dueDay: 5 },
  { id: 'phone', name: 'Phone & internet', kind: 'need', budgetCents: 9500, fixed: true, dueDay: 8 },
  { id: 'health', name: 'Healthcare', kind: 'need', budgetCents: 11000, fixed: false, dueDay: null },
  { id: 'childcare', name: 'Childcare', kind: 'need', budgetCents: 35000, fixed: true, dueDay: 1 },
  { id: 'dining', name: 'Dining out', kind: 'want', budgetCents: 22000, fixed: false, dueDay: null },
  { id: 'entertainment', name: 'Entertainment', kind: 'want', budgetCents: 14000, fixed: false, dueDay: null },
  { id: 'subscriptions', name: 'Subscriptions', kind: 'want', budgetCents: 5500, fixed: true, dueDay: 2 },
  { id: 'clothing', name: 'Clothing', kind: 'want', budgetCents: 11000, fixed: false, dueDay: null },
  { id: 'hobbies', name: 'Hobbies', kind: 'want', budgetCents: 9000, fixed: false, dueDay: null },
  { id: 'gifts', name: 'Gifts', kind: 'want', budgetCents: 7000, fixed: false, dueDay: null },
  { id: 'emergency', name: 'Emergency fund', kind: 'saving', budgetCents: 42000, fixed: true, dueDay: 1 },
  { id: 'vacation', name: 'Family vacation', kind: 'saving', budgetCents: 20000, fixed: true, dueDay: 1 },
  { id: 'car', name: 'New car', kind: 'saving', budgetCents: 24000, fixed: true, dueDay: 1 },
  { id: 'retirement', name: 'Retirement', kind: 'saving', budgetCents: 26000, fixed: true, dueDay: 1 },
];

// Transactions. amountCents is negative for money out, positive for money in.
// A transaction whose category is a 'saving' kind is a transfer to savings, not
// spending: the app counts it under "saved", never under "spent".
export const TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', description: 'Rent — November', categoryId: 'housing', amountCents: -125000 },
  { id: 't02', date: '2026-11-01', description: 'Childcare — first half', categoryId: 'childcare', amountCents: -17500 },
  { id: 't03', date: '2026-11-01', description: 'Emergency fund transfer', categoryId: 'emergency', amountCents: -42000 },
  { id: 't04', date: '2026-11-01', description: 'Vacation fund transfer', categoryId: 'vacation', amountCents: -20000 },
  { id: 't05', date: '2026-11-01', description: 'New car fund transfer', categoryId: 'car', amountCents: -24000 },
  { id: 't06', date: '2026-11-01', description: 'Retirement contribution', categoryId: 'retirement', amountCents: -26000 },
  { id: 't07', date: '2026-11-02', description: 'Supermarket — weekly shop', categoryId: 'groceries', amountCents: -8240 },
  { id: 't08', date: '2026-11-02', description: 'Music streaming', categoryId: 'subscriptions', amountCents: -1099 },
  { id: 't09', date: '2026-11-03', description: 'Fuel', categoryId: 'transport', amountCents: -4200 },
  { id: 't10', date: '2026-11-04', description: 'Electricity bill', categoryId: 'utilities', amountCents: -9620 },
  { id: 't11', date: '2026-11-05', description: 'Car insurance — monthly', categoryId: 'insurance', amountCents: -16000 },
  { id: 't12', date: '2026-11-05', description: 'Video streaming', categoryId: 'subscriptions', amountCents: -1499 },
  { id: 't13', date: '2026-11-06', description: 'Supermarket — weekly shop', categoryId: 'groceries', amountCents: -7115 },
  { id: 't14', date: '2026-11-06', description: 'Birthday gift', categoryId: 'gifts', amountCents: -3500 },
  { id: 't15', date: '2026-11-07', description: 'Restaurant — family dinner', categoryId: 'dining', amountCents: -4830 },
  { id: 't16', date: '2026-11-08', description: 'Internet', categoryId: 'phone', amountCents: -5500 },
  { id: 't17', date: '2026-11-08', description: 'Mobile phone', categoryId: 'phone', amountCents: -4000 },
  { id: 't18', date: '2026-11-09', description: 'Supermarket — weekly shop', categoryId: 'groceries', amountCents: -8830 },
  { id: 't19', date: '2026-11-09', description: 'Cinema tickets', categoryId: 'entertainment', amountCents: -2800 },
  { id: 't20', date: '2026-11-10', description: 'Fuel', categoryId: 'transport', amountCents: -3850 },
  { id: 't21', date: '2026-11-10', description: 'Books', categoryId: 'hobbies', amountCents: -2450 },
  { id: 't22', date: '2026-11-11', description: 'Water bill', categoryId: 'utilities', amountCents: -4175 },
  { id: 't23', date: '2026-11-12', description: 'Pharmacy', categoryId: 'health', amountCents: -3460 },
  { id: 't24', date: '2026-11-12', description: 'Cloud storage', categoryId: 'subscriptions', amountCents: -999 },
  { id: 't25', date: '2026-11-13', description: 'Supermarket — weekly shop', categoryId: 'groceries', amountCents: -6490 },
  { id: 't26', date: '2026-11-14', description: 'Takeout', categoryId: 'dining', amountCents: -3275 },
  { id: 't27', date: '2026-11-15', description: 'Childcare — second half', categoryId: 'childcare', amountCents: -17500 },
  { id: 't28', date: '2026-11-15', description: 'Gas bill', categoryId: 'utilities', amountCents: -3860 },
  { id: 't29', date: '2026-11-16', description: 'Supermarket — weekly shop', categoryId: 'groceries', amountCents: -7925 },
  { id: 't30', date: '2026-11-16', description: 'Concert tickets', categoryId: 'entertainment', amountCents: -6500 },
  { id: 't31', date: '2026-11-17', description: 'Fuel', categoryId: 'transport', amountCents: -4475 },
  { id: 't32', date: '2026-11-18', description: "Kids' shoes", categoryId: 'clothing', amountCents: -6200 },
  { id: 't33', date: '2026-11-19', description: 'Dentist copay', categoryId: 'health', amountCents: -4500 },
  { id: 't34', date: '2026-11-20', description: 'Supermarket — weekly shop', categoryId: 'groceries', amountCents: -7350 },
  { id: 't35', date: '2026-11-20', description: 'News subscription', categoryId: 'subscriptions', amountCents: -799 },
  { id: 't36', date: '2026-11-21', description: 'Cafe', categoryId: 'dining', amountCents: -1840 },
  { id: 't37', date: '2026-11-24', description: 'Bus pass', categoryId: 'transport', amountCents: -5200 },
  { id: 't38', date: '2026-11-24', description: 'Craft supplies', categoryId: 'hobbies', amountCents: -1875 },
];

// Savings goals. savedCents is the balance already set aside (built over past
// months, not only this month's transfers). targetCents is the goal; monthlyCents
// is the planned monthly contribution. The app works out the months left and the
// finish date from these three numbers.
export const GOALS = [
  {
    id: 'goal-emergency',
    name: 'Emergency fund',
    note: 'Three months of essential spending ($2,865 × 3 = $8,595, rounded to $8,600)',
    targetCents: 860000,
    savedCents: 320000,
    monthlyCents: 42000,
  },
  {
    id: 'goal-vacation',
    name: 'Family vacation',
    note: 'A week away next summer',
    targetCents: 180000,
    savedCents: 64000,
    monthlyCents: 20000,
  },
  {
    id: 'goal-car',
    name: 'New car down payment',
    note: 'For the car we will need next year',
    targetCents: 400000,
    savedCents: 115000,
    monthlyCents: 24000,
  },
];
