// Hearth & Ledger — money maths for repository iosai2035/best-household-budget-site-20261126.
// Every amount is an integer number of US cents. All addition, subtraction and
// comparison happens on cents, so no floating-point rounding ever creeps into a
// total. Only the final display divides by 100, and Intl.NumberFormat rounds
// that to two decimals, which is exact for currency display.

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// Format integer cents as dollars, e.g. 45950 -> "$459.50". Negative amounts
// keep their minus sign: -2050 -> "-$20.50".
export function formatCents(cents) {
  return usd.format(cents / 100);
}

// Format integer cents as dollars without the sign, for "spent" columns.
export function formatAbsCents(cents) {
  return usd.format(Math.abs(cents) / 100);
}

// Parse a user-typed dollar amount ("12.34", "12", "$12.34") into integer cents.
// Returns null when the text is not a valid non-negative amount.
export function parseDollars(text) {
  const cleaned = String(text).trim().replace(/^\$/, '').replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ''] = cleaned.split('.');
  return Number(whole) * 100 + Number((frac + '00').slice(0, 2));
}

// Sum the amounts of a list of transactions (each carries amountCents).
export function sumAmounts(rows) {
  return rows.reduce((total, row) => total + row.amountCents, 0);
}

// Money spent in one category: the absolute value of its negative transactions.
// A transfer to a 'saving' category is measured the same way — a negative
// transaction in that category — so callers use this one function for both
// spending and saving, and there is no second copy of the sum to drift apart.
export function spentInCategory(transactions, categoryId) {
  return -sumAmounts(transactions.filter((t) => t.categoryId === categoryId && t.amountCents < 0));
}

// The 50/30/20 rule (Elizabeth Warren and Amelia Warren Tyagi, "All Your Worth",
// 2005): after-tax income splits into at most 50% needs, at most 30% wants, and
// at least 20% savings and extra debt payments. Targets are rounded to the
// nearest cent; the three shares always add back to the income.
export function fiftyThirtyTwenty(incomeCents) {
  const needs = Math.round(incomeCents * 0.5);
  const wants = Math.round(incomeCents * 0.3);
  const savings = incomeCents - needs - wants;
  return { needs, wants, savings };
}

// A category's share of income as a percentage with one decimal, e.g. 59.7.
export function shareOfIncome(amountCents, incomeCents) {
  if (incomeCents <= 0) return 0;
  return Math.round((amountCents / incomeCents) * 1000) / 10;
}

// Whole months left to reach a savings goal at a fixed monthly contribution,
// rounded up (a partial month still counts as a month). Infinity when the
// monthly contribution is zero and the goal is not yet reached.
export function monthsToGoal(targetCents, savedCents, monthlyCents) {
  const remaining = targetCents - savedCents;
  if (remaining <= 0) return 0;
  if (monthlyCents <= 0) return Infinity;
  return Math.ceil(remaining / monthlyCents);
}

// The calendar month in which a goal is reached, counting from a start date
// (a Date) by a number of months. Returns "Month YYYY", e.g. "December 2027".
export function goalFinishMonth(startDate, months) {
  if (!Number.isFinite(months)) return null;
  const finish = new Date(startDate.getFullYear(), startDate.getMonth() + months, 1);
  return finish.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Months of essential spending an emergency fund covers: balance divided by
// one month of needs, to one decimal.
export function emergencyCoverageMonths(savedCents, monthlyNeedsCents) {
  if (monthlyNeedsCents <= 0) return 0;
  return Math.round((savedCents / monthlyNeedsCents) * 10) / 10;
}

// A short date for a transaction, e.g. "Nov 7".
export function shortDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Spending through one calendar month, grouped into the weeks that fall inside
// it: days 1–7, 8–14, 15–21 and 22 to the last day. Only money out in a need or
// want category counts as spending — transfers to a saving category are not
// spending, so they are left out here exactly as they are on the dashboard.
// month is 1-based (11 = November). Each bucket is { label, startDay, endDay,
// spentCents }; the buckets always add back to the month's spending total.
export function weeklySpending(transactions, categories, year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
  const savingIds = new Set(categories.filter((c) => c.kind === 'saving').map((c) => c.id));
  const bounds = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, lastDay],
  ];
  return bounds.map(([startDay, endDay]) => {
    const spent = -sumAmounts(
      transactions.filter((t) => {
        if (t.amountCents >= 0 || savingIds.has(t.categoryId)) return false;
        const [y, m, d] = t.date.split('-').map(Number);
        return y === year && m === month && d >= startDay && d <= endDay;
      }),
    );
    return {
      label: `${monthName} ${startDay}–${endDay}`,
      startDay,
      endDay,
      spentCents: spent,
    };
  });
}

// A "what-if" move of money between the three shares of the budget: take
// moveFromNeedCents out of the needs plan and moveFromWantCents out of the
// wants plan and put both into savings. Each move is clamped to what its share
// actually holds, so the result can never go negative and the three shares
// still add up to the same planned total. Returns the new budgets, their
// shares of income, the amount moved and what it adds up to over a year.
export function shiftShares(incomeCents, budgets, moveFromNeedCents, moveFromWantCents) {
  const fromNeed = Math.max(0, Math.min(moveFromNeedCents, budgets.need));
  const fromWant = Math.max(0, Math.min(moveFromWantCents, budgets.want));
  const need = budgets.need - fromNeed;
  const want = budgets.want - fromWant;
  const saving = budgets.saving + fromNeed + fromWant;
  return {
    need,
    want,
    saving,
    movedCents: fromNeed + fromWant,
    clamped: fromNeed !== moveFromNeedCents || fromWant !== moveFromWantCents,
    extraPerYearCents: (fromNeed + fromWant) * 12,
    shares: {
      need: shareOfIncome(need, incomeCents),
      want: shareOfIncome(want, incomeCents),
      saving: shareOfIncome(saving, incomeCents),
    },
  };
}
