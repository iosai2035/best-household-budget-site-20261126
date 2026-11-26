// Hearth & Ledger — state for repository iosai2035/best-household-budget-site.
// Holds the household's data in memory and saves it to the browser's own
// localStorage, so the budget survives a reload and stays on the user's device
// — nothing is ever sent anywhere. When localStorage is unavailable (a private
// window, or a host that blocks it) the app keeps working in memory and simply
// does not persist. "Reset demo data" restores the seed from data.js.

import { CATEGORIES, GOALS, HOUSEHOLD, INCOME, TRANSACTIONS } from './data.js';

const STORAGE_KEY = 'hearth-ledger-v1';

// A counter that keeps generated ids unique even when two are created in the
// same millisecond (Date.now() alone would collide then).
let nextId = 0;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function seedState() {
  return {
    household: clone(HOUSEHOLD),
    income: clone(INCOME),
    categories: clone(CATEGORIES),
    transactions: clone(TRANSACTIONS),
    goals: clone(GOALS),
  };
}

function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.transactions)) return null;
    return parsed;
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

export const store = {
  state: loadSaved() ?? seedState(),
  persisted: (() => {
    try {
      window.localStorage.setItem('__hearth-ledger-test__', '1');
      window.localStorage.removeItem('__hearth-ledger-test__');
      return true;
    } catch {
      return false;
    }
  })(),

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
  // money in. The id is unique inside this household's data.
  addTransaction({ date, description, categoryId, amountCents }) {
    const id = `t-${Date.now().toString(36)}-${nextId++}`;
    this.state.transactions.push({ id, date, description, categoryId, amountCents });
    this.commit();
    return id;
  },

  removeTransaction(id) {
    this.state.transactions = this.state.transactions.filter((t) => t.id !== id);
    this.commit();
  },

  // Change one category's monthly budget (in cents). The budget page calls this
  // from its inline editors; the totals on every page recompute from the data.
  setBudget(categoryId, budgetCents) {
    const category = this.state.categories.find((c) => c.id === categoryId);
    if (!category) return false;
    category.budgetCents = Math.max(0, Math.round(budgetCents));
    this.commit();
    return true;
  },

  // Add a savings goal. savedCents starts at 0 unless the caller says otherwise.
  addGoal({ name, targetCents, monthlyCents, note = '' }) {
    const id = `goal-${Date.now().toString(36)}-${nextId++}`;
    this.state.goals.push({ id, name, note, targetCents, savedCents: 0, monthlyCents });
    this.commit();
    return id;
  },

  // Record money put toward a goal (a contribution) or taken out of it.
  // A contribution is a positive number of cents added to the saved balance.
  contributeToGoal(goalId, amountCents) {
    const goal = this.state.goals.find((g) => g.id === goalId);
    if (!goal) return false;
    goal.savedCents = Math.max(0, goal.savedCents + amountCents);
    this.commit();
    return true;
  },

  // The month this household's data describes, as "November 2026".
  monthLabel() {
    return this.state.household.month;
  },
};
