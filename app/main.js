// Hearth & Ledger — router and controller for repository iosai2035/best-household-budget-site-20261126.
// Hash routes, one page each, all reached by a link in the header. The route
// table below is the site's map: each entry names its path, its page title and
// the view that renders it, so adding a page means adding one row, not
// rewiring the router. The summary is the month's arithmetic, computed from
// the store's data in integer cents. window.__shotReady is false while a page
// renders and true once it is on screen, so a screenshot script knows when to
// capture. The theme toggle lives in the header and is remembered in the
// browser, separately from the budget data.
//
// Forms are handled by a dispatch table (FORM_HANDLERS): one small function
// per form action, looked up by the form's data-action. Adding a form means
// adding one entry, and each handler can be read without wading through the
// others. Validation problems from the store are shown in the form's own
// error line instead of failing silently.

import { downloadCsv, exportLabel, transactionsToCsv } from './export.js';
import { store } from './store.js';
import {
  budgetView,
  dashboardView,
  filterTransactions,
  goalsView,
  guideView,
  notFoundView,
  plannerView,
  transactionRow,
  transactionsView,
} from './views.js';
import {
  emergencyCoverageMonths,
  fiftyThirtyTwenty,
  formatCents,
  goalFinishMonth,
  monthsToGoal,
  parseDollars,
  shareOfIncome,
  shiftShares,
  spentInCategory,
  weeklySpending,
} from './money.js';

const app = document.getElementById('app');
let pendingScrollTo = null;

// The transaction filter on the transactions page: what the user typed, which
// category and which direction. It lives outside the store because it is a
// view of the data, not data itself — resetting the demo data does not clear
// it, and it is never saved.
const txFilter = { query: '', categoryId: '', direction: '' };

const THEME_KEY = 'hearth-ledger-theme';

// The saved theme, or the operating system's, when nothing was saved.
function savedTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Storage unavailable: fall through to the system preference.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply a theme to the page. Only an explicit toggle saves the choice; the
// first application (from the saved choice or the system) does not, so the
// page keeps following the system until the user picks a side.
function applyTheme(theme, persist = false) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    toggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  }
  if (!persist) return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage unavailable: the theme still applies for this visit.
  }
}

// The month's arithmetic, from the store's data. Every figure the pages show
// comes from here, so the dashboard, the budget and the planner always agree.
function buildSummary(state) {
  const income = state.income.reduce((total, row) => total + row.amountCents, 0);
  const byCategory = state.categories.map((category) => {
    const spent = category.kind === 'saving' ? 0 : spentInCategory(state.transactions, category.id);
    const saved = category.kind === 'saving' ? spentInCategory(state.transactions, category.id) : 0;
    return { category, spent, saved, remaining: category.budgetCents - spent };
  });
  const byKind = { need: { budget: 0, spent: 0 }, want: { budget: 0, spent: 0 }, saving: { budget: 0, spent: 0 } };
  for (const row of byCategory) {
    byKind[row.category.kind].budget += row.category.budgetCents;
    byKind[row.category.kind].spent += row.spent;
  }
  for (const kind of Object.keys(byKind)) {
    byKind[kind].share = shareOfIncome(byKind[kind].budget, income);
  }
  const spentNeeds = byKind.need.spent;
  const spentWants = byKind.want.spent;
  const spentTotal = spentNeeds + spentWants;
  const saved = byCategory.reduce((total, row) => total + row.saved, 0);
  const budgetTotal = byKind.need.budget + byKind.want.budget + byKind.saving.budget;
  const unassigned = income - budgetTotal;
  const left = income - spentTotal - saved;
  const fifty = fiftyThirtyTwenty(income);
  const lowEnvelopes = byCategory
    .filter((row) => row.category.kind !== 'saving' && (row.remaining < 0 || (!row.category.fixed && row.remaining < row.category.budgetCents * 0.3)))
    .sort((a, b) => a.remaining / a.category.budgetCents - b.remaining / b.category.budgetCents)
    .slice(0, 5);
  const sorted = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const firstDate = state.transactions.reduce((earliest, t) => (t.date < earliest ? t.date : earliest), state.transactions[0]?.date ?? '2026-11-01');
  const [year, month] = firstDate.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const goals = state.goals.map((goal) => {
    const pct = goal.targetCents > 0 ? goal.savedCents / goal.targetCents : 0;
    const monthsLeft = monthsToGoal(goal.targetCents, goal.savedCents, goal.monthlyCents);
    return { goal, pct, monthsLeft, finish: goalFinishMonth(monthStart, monthsLeft) };
  });
  const emergencyGoal = state.goals.find((g) => g.id === 'goal-emergency');
  const retirement = state.categories.find((c) => c.id === 'retirement');
  const weekly = weeklySpending(state.transactions, state.categories, year, month);
  const heaviest = weekly.reduce((a, b) => (b.spentCents > a.spentCents ? b : a), weekly[0]);
  const trendSummary = `Spending was heaviest in ${heaviest.label} at ${formatCents(heaviest.spentCents)}, of ${formatCents(spentTotal)} for the month — rent, childcare and the first week's shopping all land in that week.`;
  return {
    income,
    spentNeeds,
    spentWants,
    spentTotal,
    saved,
    left,
    budgetTotal,
    unassigned,
    fifty,
    byCategory,
    byKind,
    lowEnvelopes,
    recent: sorted.slice(0, 8),
    transactions: sorted,
    goals,
    monthStart,
    emergencySaved: emergencyGoal ? emergencyGoal.savedCents : 0,
    emergencyTarget: emergencyGoal ? emergencyGoal.targetCents : 0,
    emergencyMonths: emergencyCoverageMonths(emergencyGoal ? emergencyGoal.savedCents : 0, byKind.need.budget),
    retirementMonthly: retirement ? retirement.budgetCents : 0,
    weekly,
    trendSummary,
  };
}

// The route table: path, page title and view. The title is what the browser
// tab shows; the view is the function that renders the page.
const ROUTES = [
  { path: '/', title: 'Hearth & Ledger', view: dashboardView },
  { path: '/budget', title: 'Budget | Hearth & Ledger', view: budgetView },
  { path: '/transactions', title: 'Transactions | Hearth & Ledger', view: transactionsView },
  { path: '/goals', title: 'Goals | Hearth & Ledger', view: goalsView },
  { path: '/planner', title: 'Planner | Hearth & Ledger', view: plannerView },
  { path: '/guide', title: 'Guide | Hearth & Ledger', view: guideView },
];

function routeFor(path) {
  return ROUTES.find((route) => route.path === path) ?? null;
}

function render({ scrollTop = true } = {}) {
  window.__shotReady = false;
  const route = location.hash.replace(/^#/, '') || '/';
  const matched = routeFor(route);
  const view = matched ? matched.view : notFoundView;
  const summary = buildSummary(store.state);
  document.title = matched ? matched.title : 'Not found | Hearth & Ledger';
  app.innerHTML = view(store.state, summary, txFilter);
  document.querySelectorAll('header nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === `#${route}` || (route === '/' && href === '#/')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  // Only a route change scrolls to the top. A re-render after an edit (a budget
  // amount, a new transaction) keeps the user's place on the page.
  if (scrollTop) window.scrollTo(0, 0);
  window.__shotReady = true;
  if (pendingScrollTo) {
    const target = document.getElementById(pendingScrollTo);
    pendingScrollTo = null;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function rerender() {
  render({ scrollTop: false });
}

// Re-render only the transactions table and its count, after a filter change.
// The search box keeps focus this way; a full re-render would drop it.
function rerenderTxTable() {
  const body = document.getElementById('tx-table-body');
  const count = document.getElementById('tx-count');
  const exportButton = document.querySelector('button[data-action="export-csv"]');
  if (!body || !count) return;
  const summary = buildSummary(store.state);
  const shown = filterTransactions(summary.transactions, txFilter);
  body.innerHTML =
    shown.map((t) => transactionRow(t, store.state.categories)).join('') ||
    '<tr><td colspan="5">No transactions match this filter.</td></tr>';
  count.textContent = `${shown.length} of ${summary.transactions.length} transactions`;
  if (exportButton) exportButton.textContent = exportLabel(shown.length);
}

function formValues(form) {
  const values = {};
  new FormData(form).forEach((value, key) => {
    values[key] = value;
  });
  return values;
}

// Show the store's validation problems in a form's error line, or clear it.
// The line is hidden when there is nothing to say, so it never takes space
// on a form that is fine.
function showFormError(id, problems) {
  const line = document.getElementById(id);
  if (!line) return;
  if (!problems || problems.length === 0) {
    line.hidden = true;
    line.textContent = '';
    return;
  }
  line.hidden = false;
  line.textContent = problems.join(' ');
}

// --- Form handlers ----------------------------------------------------------
// One function per form action. Each takes the form and its values, and
// either updates the store and re-renders, or writes into its own result
// area for the calculators.

function handleAddTransaction(form, values) {
  const cents = parseDollars(values.amount);
  // Name each problem instead of one generic line, so the user sees exactly
  // which field to fix.
  const problems = [];
  if (!values.date) problems.push('Enter a date.');
  if (!values.description.trim()) problems.push('Enter a description.');
  if (cents === null) problems.push('Enter an amount above $0.00.');
  if (problems.length > 0) {
    showFormError('tx-form-error', problems);
    return;
  }
  const fields = {
    date: values.date,
    description: values.description.trim(),
    categoryId: values.categoryId,
    amountCents: values.direction === 'in' ? cents : -cents,
  };
  // The same form edits a transaction when it carries an id: the Edit button
  // on a row fills the form in and stores the id in the hidden field.
  if (values.editId) {
    const result = store.editTransaction(values.editId, fields);
    if (!result.ok) {
      showFormError('tx-form-error', result.problems);
      return;
    }
  } else {
    const result = store.addTransaction(fields);
    if (!result.id) {
      showFormError('tx-form-error', result.problems);
      return;
    }
  }
  form.reset();
  resetTransactionForm();
  rerender();
}

function handleContributeGoal(form, values) {
  const cents = parseDollars(values.amount);
  if (cents === null) return;
  store.contributeToGoal(values.goalId, cents);
  rerender();
}

function handleAddGoal(form, values) {
  const target = parseDollars(values.target);
  const monthly = parseDollars(values.monthly);
  if (target === null || monthly === null || !values.name.trim()) return;
  const result = store.addGoal({ name: values.name.trim(), targetCents: target, monthlyCents: monthly, note: values.note.trim() });
  if (!result.id) return;
  rerender();
}

function handleCalc503020(form, values) {
  const cents = parseDollars(values.income);
  const result = document.getElementById('calc-503020-result');
  if (cents === null || !result) return;
  const split = fiftyThirtyTwenty(cents);
  result.innerHTML = `<p>On ${formatCents(cents)}: needs ${formatCents(split.needs)}, wants ${formatCents(split.wants)}, savings ${formatCents(split.savings)}.</p>`;
}

function handleCalcEmergency(form, values) {
  const cents = parseDollars(values.essentials);
  const result = document.getElementById('calc-emergency-result');
  if (cents === null || !result) return;
  const summary = buildSummary(store.state);
  const covered = emergencyCoverageMonths(summary.emergencySaved, cents);
  result.innerHTML = `<p>Three months: ${formatCents(cents * 3)}. Six months: ${formatCents(cents * 6)}. Your fund of ${formatCents(summary.emergencySaved)} covers ${covered} months of it.</p>`;
}

function handleCalcWhatif(form, values) {
  const fromWant = parseDollars(values.fromWant);
  const fromNeed = parseDollars(values.fromNeed);
  const result = document.getElementById('calc-whatif-result');
  if (fromWant === null || fromNeed === null || !result) return;
  const summary = buildSummary(store.state);
  const budgets = {
    need: summary.byKind.need.budget,
    want: summary.byKind.want.budget,
    saving: summary.byKind.saving.budget,
  };
  const shifted = shiftShares(summary.income, budgets, fromNeed, fromWant);
  const clampedNote = shifted.clamped
    ? ' The move was trimmed to what the shares hold — a share cannot go below $0.'
    : '';
  result.innerHTML = `<p>Moving ${formatCents(shifted.movedCents)} a month to savings gives ${formatCents(shifted.need)} needs (${shifted.shares.need}%, target ${formatCents(summary.fifty.needs)}), ${formatCents(shifted.want)} wants (${shifted.shares.want}%, target ${formatCents(summary.fifty.wants)}) and ${formatCents(shifted.saving)} savings (${shifted.shares.saving}%, target ${formatCents(summary.fifty.savings)}). That is ${formatCents(shifted.extraPerYearCents)} more saved over a year.${clampedNote}</p>`;
}

function handleCalcGoal(form, values) {
  const target = parseDollars(values.target);
  const saved = parseDollars(values.saved);
  const monthly = parseDollars(values.monthly);
  const result = document.getElementById('calc-goal-result');
  if (target === null || saved === null || monthly === null || !result) return;
  const summary = buildSummary(store.state);
  const months = monthsToGoal(target, saved, monthly);
  if (!Number.isFinite(months)) {
    result.innerHTML = '<p>With no monthly contribution the goal has no finish date. Add one to see it.</p>';
    return;
  }
  if (months === 0) {
    result.innerHTML = '<p>Already there — the saved amount meets the target.</p>';
    return;
  }
  const finish = goalFinishMonth(summary.monthStart, months);
  result.innerHTML = `<p>${formatCents(target - saved)} left at ${formatCents(monthly)} a month is ${months} month${months === 1 ? '' : 's'} — finished around ${finish}.</p>`;
}

// The dispatch table: form data-action -> handler. The filter form updates
// live as the user types; submitting it (Enter) changes nothing, so its
// handler only stops the page reloading.
const FORM_HANDLERS = {
  'filter-transactions': () => {},
  'add-transaction': handleAddTransaction,
  'contribute-goal': handleContributeGoal,
  'add-goal': handleAddGoal,
  'calc-503020': handleCalc503020,
  'calc-emergency': handleCalcEmergency,
  'calc-whatif': handleCalcWhatif,
  'calc-goal': handleCalcGoal,
};

app.addEventListener('submit', (event) => {
  const form = event.target.closest('form[data-action]');
  if (!form) return;
  event.preventDefault();
  const handler = FORM_HANDLERS[form.dataset.action];
  if (handler) handler(form, formValues(form));
});

// --- Editing a transaction --------------------------------------------------
// The Edit button on a row fills the add form with that transaction's values
// and turns the form into an edit form: the submit button says "Save changes"
// and a Cancel button appears. Submitting saves the edit (handleAddTransaction
// above); cancelling, or a successful save, puts the form back to adding.

function resetTransactionForm() {
  // form.reset() does not touch hidden inputs (they are not resettable), so
  // the edit id is cleared by hand — otherwise the next "add" would silently
  // overwrite the transaction that was being edited.
  const form = document.getElementById('tx-form');
  if (form && form.elements.editId) form.elements.editId.value = '';
  const submit = document.getElementById('tx-submit');
  const cancel = document.getElementById('tx-cancel-edit');
  if (submit) submit.textContent = 'Add transaction';
  if (cancel) cancel.hidden = true;
  showFormError('tx-form-error', []);
}

function startEditTransaction(id) {
  const transaction = store.state.transactions.find((t) => t.id === id);
  const form = document.getElementById('tx-form');
  if (!transaction || !form) return;
  form.elements.date.value = transaction.date;
  form.elements.description.value = transaction.description;
  form.elements.categoryId.value = transaction.categoryId;
  form.elements.amount.value = (Math.abs(transaction.amountCents) / 100).toFixed(2);
  form.elements.direction.value = transaction.amountCents < 0 ? 'out' : 'in';
  form.elements.editId.value = transaction.id;
  const submit = document.getElementById('tx-submit');
  const cancel = document.getElementById('tx-cancel-edit');
  if (submit) submit.textContent = 'Save changes';
  if (cancel) cancel.hidden = false;
  showFormError('tx-form-error', []);
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  form.elements.description.focus();
}

app.addEventListener('change', (event) => {
  const input = event.target.closest('input[data-action="set-budget"]');
  if (input) {
    const cents = parseDollars(input.value);
    if (cents === null) {
      rerender();
      return;
    }
    store.setBudget(input.dataset.category, cents);
    rerender();
    return;
  }
  // The transaction filters update the table as soon as they change.
  const filterInput = event.target.closest('#tx-category, #tx-direction');
  if (filterInput) {
    txFilter.categoryId = document.getElementById('tx-category').value;
    txFilter.direction = document.getElementById('tx-direction').value;
    rerenderTxTable();
  }
});

// The search box filters as the user types, without re-rendering the page.
app.addEventListener('input', (event) => {
  if (!event.target.matches('#tx-search')) return;
  txFilter.query = event.target.value;
  rerenderTxTable();
});

app.addEventListener('click', (event) => {
  const scrollLink = event.target.closest('a[data-scroll-to]');
  if (scrollLink) {
    event.preventDefault();
    const targetId = scrollLink.dataset.scrollTo;
    if (location.hash === '#/guide') {
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      pendingScrollTo = targetId;
      location.hash = '#/guide';
    }
    return;
  }
  const editButton = event.target.closest('button[data-action="edit-transaction"]');
  if (editButton) {
    startEditTransaction(editButton.dataset.id);
    return;
  }
  const cancelButton = event.target.closest('button[data-action="cancel-edit"]');
  if (cancelButton) {
    const form = document.getElementById('tx-form');
    if (form) form.reset();
    resetTransactionForm();
    return;
  }
  const deleteButton = event.target.closest('button[data-action="delete-transaction"]');
  if (deleteButton) {
    store.removeTransaction(deleteButton.dataset.id);
    rerender();
    return;
  }
  const exportButton = event.target.closest('button[data-action="export-csv"]');
  if (exportButton) {
    const summary = buildSummary(store.state);
    const shown = filterTransactions(summary.transactions, txFilter);
    const csv = transactionsToCsv(shown, store.state.categories);
    const month = store.state.household.month.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadCsv(csv, `hearth-ledger-transactions-${month}.csv`);
    const note = document.getElementById('tx-export-note');
    if (note) note.textContent = `Downloaded ${shown.length} transaction${shown.length === 1 ? '' : 's'} as CSV — the file holds exactly the rows shown above.`;
  }
});

document.addEventListener('click', (event) => {
  const resetButton = event.target.closest('button[data-action="reset-demo"]');
  if (resetButton) {
    store.reset();
    render();
    return;
  }
  const themeButton = event.target.closest('#theme-toggle');
  if (themeButton) {
    const current = document.documentElement.getAttribute('data-theme') || savedTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark', true);
  }
});

applyTheme(savedTheme());
window.addEventListener('hashchange', () => render({ scrollTop: true }));
render();
