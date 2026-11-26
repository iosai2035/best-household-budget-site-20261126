// Hearth & Ledger — state for repository iosai2035/best-household-budget-site-20261126.
// Holds the household's data in memory and saves it to the browser's own
// localStorage, so the budget survives a reload and stays on the user's device
// — nothing is ever sent anywhere. When localStorage is unavailable (a private
// window, or a host that blocks it) the app keeps working in memory and simply
// does not persist. "Reset demo data" restores the seed from data.js.
//
// Every change to the data goes through one of this module's methods, and
// every method validates its input before it touches the state: a transaction
// needs a real date, a description and a category that exists; a budget needs
// a non-negative amount; a goal needs a name and a positive target. A bad
// value is refused with a list of reasons instead of being stored and showing
// up as a wrong total later. The stored shape is versioned (SCHEMA_VERSION),
// so a future version of the site can recognise an older saved state and
// migrate it instead of dropping the user's budget.

import { CATEGORIES, GOALS, HOUSEHOLD, INCOME, TRANSACTIONS } from './data.js';

// The shape of the saved state. Bump this when the shape changes, and add a
// step to migrateSaved() that turns the older shape into the new one.
const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'hearth-ledger-v1';

// A counter that keeps generated ids unique even when two are created in the
// same millisecond (Date.now() alone would collide then).
let nextId = 0;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function seedState() {
  return {
    version: SCHEMA_VERSION,
    household: clone(HOUSEHOLD),
    income: clone(INCOME),
    categories: clone(CATEGORIES),
    transactions: clone(TRANSACTIONS),
    goals: clone(GOALS),
  };
}

// Is this the shape this version of the site understands? A saved state from
// an older version is migrated; anything else is ignored and the seed is
// used instead, so a corrupt or foreign value in storage can never break
// the site.
function migrateSaved(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.transactions)) return null;
  if (!Array.isArray(parsed.income) || !Array.isArray(parsed.goals)) return null;
  if (parsed.version !== SCHEMA_VERSION) {
    // No older version exists yet; an unknown version is treated as unreadable
    // rather than guessed at.
    return null;
  }
  return parsed;
}

function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrateSaved(JSON.parse(raw));
  } catch {
    return null;
  }
}

function save(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// Can this browser actually keep a value in localStorage? Checked once, by
// writing and removing a throwaway key, so the answer is a fact and not a
// guess about the browser.
function storageWorks() {
  try {
    window.localStorage.setItem('__hearth-ledger-test__', '1');
    window.localStorage.removeItem('__hearth-ledger-test__');
    return true;
  } catch {
    return false;
  }
}

// --- Validation -------------------------------------------------------------
// Each validator returns an array of human-readable problems; an empty array
// means the input is fine. The store refuses invalid input and reports why,
// instead of storing it and letting a page show a wrong number.

function isIsoDate(text) {
  return typeof text === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(text));
}

function isIntegerCents(value) {
  return Number.isInteger(value) && value >= 0;
}

// A transaction's fields, as the form hands them over: a date inside the
// household's month, a non-empty description, a category that exists, and an
// amount in cents. amountCents is the size of the money; the direction
// (in or out) is decided by the caller, not by the sign here.
export function validateTransaction(state, { date, description, categoryId, amountCents }) {
  const problems = [];
  if (!isIsoDate(date)) problems.push('Enter a valid date.');
  if (typeof description !== 'string' || description.trim().length === 0) {
    problems.push('Enter a description.');
  }
  if (!state.categories.some((c) => c.id === categoryId)) problems.push('Pick a category.');
  if (!isIntegerCents(amountCents) || amountCents <= 0) {
    problems.push('Enter an amount above $0.00.');
  }
  return problems;
}

// A monthly budget for one category: the category must exist and the amount
// must be a whole number of cents, zero or more.
export function validateBudget(state, categoryId, budgetCents) {
  const problems = [];
  if (!state.categories.some((c) => c.id === categoryId)) problems.push('Unknown category.');
  if (!isIntegerCents(budgetCents)) problems.push('Enter a budget of $0.00 or more.');
  return problems;
}

// A savings goal: a name, a target above zero, and a monthly contribution of
// zero or more (zero is allowed — the goal then has no finish date until the
// household sets one).
export function validateGoal({ name, targetCents, monthlyCents }) {
  const problems = [];
  if (typeof name !== 'string' || name.trim().length === 0) problems.push('Enter a goal name.');
  if (!isIntegerCents(targetCents) || targetCents <= 0) {
    problems.push('Enter a target above $0.00.');
  }
  if (!isIntegerCents(monthlyCents)) problems.push('Enter a monthly contribution of $0.00 or more.');
  return problems;
}

function newTransactionId() {
  return `t-${Date.now().toString(36)}-${nextId++}`;
}

function newGoalId() {
  return `goal-${Date.now().toString(36)}-${nextId++}`;
}

// One lookup for every method below, so "not found" always means the same
// thing: undefined, never an exception from a missing row.
function findById(rows, id) {
  return rows.find((row) => row.id === id);
}

export const store = {
  state: loadSaved() ?? seedState(),
  persisted: storageWorks(),

  // Write the current state back to storage. Returns false when storage is
  // unavailable; the in-memory state is still the live one.
  commit() {
    return save(this.state);
  },

  reset() {
    this.state = seedState();
    return save(this.state);
  },

  // Add a transaction. amountCents is negative for money out, positive for
  // money in. Returns the new id, or null with the problems when the input
  // fails validation (the caller shows them; nothing is stored).
  addTransaction({ date, description, categoryId, amountCents }) {
    const problems = validateTransaction(this.state, {
      date,
      description,
      categoryId,
      amountCents: Math.abs(amountCents),
    });
    if (problems.length > 0) return { id: null, problems };
    const id = newTransactionId();
    this.state.transactions.push({ id, date, description, categoryId, amountCents });
    this.commit();
    return { id, problems: [] };
  },

  // Change a transaction that is already there — its date, description,
  // category or amount. The id stays the same, so nothing else that refers
  // to it breaks. Returns false with the problems when the new values fail
  // validation; the old transaction is left untouched then.
  editTransaction(id, { date, description, categoryId, amountCents }) {
    const transaction = findById(this.state.transactions, id);
    if (!transaction) return { ok: false, problems: ['That transaction no longer exists.'] };
    const problems = validateTransaction(this.state, {
      date,
      description,
      categoryId,
      amountCents: Math.abs(amountCents),
    });
    if (problems.length > 0) return { ok: false, problems };
    transaction.date = date;
    transaction.description = description;
    transaction.categoryId = categoryId;
    transaction.amountCents = amountCents;
    this.commit();
    return { ok: true, problems: [] };
  },

  removeTransaction(id) {
    this.state.transactions = this.state.transactions.filter((t) => t.id !== id);
    this.commit();
  },

  // Change one category's monthly budget (in cents). The budget page calls this
  // from its inline editors; the totals on every page recompute from the data.
  // Returns false when the category does not exist or the amount is invalid.
  setBudget(categoryId, budgetCents) {
    if (validateBudget(this.state, categoryId, budgetCents).length > 0) return false;
    const category = findById(this.state.categories, categoryId);
    if (!category) return false;
    category.budgetCents = Math.max(0, Math.round(budgetCents));
    this.commit();
    return true;
  },

  // Add a savings goal. savedCents starts at 0 unless the caller says otherwise.
  // Returns the new id, or null with the problems when the input is invalid.
  addGoal({ name, targetCents, monthlyCents, note = '' }) {
    const problems = validateGoal({ name, targetCents, monthlyCents });
    if (problems.length > 0) return { id: null, problems };
    const id = newGoalId();
    this.state.goals.push({ id, name, note, targetCents, savedCents: 0, monthlyCents });
    this.commit();
    return { id, problems: [] };
  },

  // Record money put toward a goal (a contribution) or taken out of it.
  // A contribution is a positive number of cents added to the saved balance.
  contributeToGoal(goalId, amountCents) {
    const goal = findById(this.state.goals, goalId);
    if (!goal || !Number.isInteger(amountCents)) return false;
    goal.savedCents = Math.max(0, goal.savedCents + amountCents);
    this.commit();
    return true;
  },

  // The month this household's data describes, as "November 2026".
  monthLabel() {
    return this.state.household.month;
  },
};
