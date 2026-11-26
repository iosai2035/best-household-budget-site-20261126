// Hearth & Ledger — pages for repository iosai2035/best-household-budget-site-20261126.
// Each page is a function that takes the store's state and the month's summary
// (built by main.js) and returns HTML. Every value that came from the user is
// escaped before it reaches the page. All money is formatted from integer
// cents by money.js, so the figures on screen are the figures in the data.
// The transactions page also takes the current filter (main.js keeps it), so
// searching never reloads the page — only the table rows change.

import { CATEGORY_COLOURS, barChart, donutChart, goalBar, meterBar } from './charts.js';
import { exportLabel } from './export.js';
import { GUIDE_SECTIONS } from './guide.js';
import { formatAbsCents, formatCents, shortDate } from './money.js';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const KIND_LABEL = { need: 'Needs', want: 'Wants', saving: 'Savings' };

function kindBadge(kind) {
  return `<span class="kind kind-${kind}">${KIND_LABEL[kind]}</span>`;
}

function categoryRow(row) {
  const { category, spent, remaining } = row;
  const over = remaining < 0;
  const used = category.budgetCents > 0 ? spent / category.budgetCents : 0;
  return `<tr class="${over ? 'over' : ''}">
    <td><span class="dot" style="background:${CATEGORY_COLOURS[category.id] || '#888'}"></span>${escapeHtml(category.name)} ${kindBadge(category.kind)}</td>
    <td class="num"><label class="sr-only" for="budget-${category.id}">Monthly budget for ${escapeHtml(category.name)}</label><span class="currency">$</span><input id="budget-${category.id}" class="budget-input" type="number" min="0" step="0.01" inputmode="decimal" value="${(category.budgetCents / 100).toFixed(2)}" data-action="set-budget" data-category="${category.id}"></td>
    <td class="num">${formatAbsCents(spent)}</td>
    <td class="num ${over ? 'negative' : 'positive'}">${over ? '−' : ''}${formatAbsCents(remaining)}</td>
    <td class="bar-cell">${meterBar(used, 1, CATEGORY_COLOURS[category.id] || '#888', over)}</td>
  </tr>`;
}

function monthDay(isoDate) {
  return shortDate(isoDate);
}

// One transaction as a table row. Exported so main.js can re-render just the
// table body when the search box changes, without losing the user's place.
export function transactionRow(t, categories) {
  const category = categories.find((c) => c.id === t.categoryId);
  return `<tr>
      <td>${monthDay(t.date)}</td>
      <td>${escapeHtml(t.description)}</td>
      <td>${category ? escapeHtml(category.name) : '—'}</td>
      <td class="num ${t.amountCents < 0 ? 'out' : 'in'}">${t.amountCents < 0 ? '−' : '+'}${formatAbsCents(t.amountCents)}</td>
      <td><button class="link-button" data-action="delete-transaction" data-id="${t.id}" aria-label="Delete ${escapeHtml(t.description)}">Delete</button></td>
    </tr>`;
}

// The transactions that match the current filter: a text search over the
// description, one category, and money in or out. An empty filter shows all.
export function filterTransactions(transactions, filter) {
  const query = (filter.query || '').trim().toLowerCase();
  return transactions.filter((t) => {
    if (filter.categoryId && t.categoryId !== filter.categoryId) return false;
    if (filter.direction === 'out' && t.amountCents >= 0) return false;
    if (filter.direction === 'in' && t.amountCents <= 0) return false;
    if (query && !t.description.toLowerCase().includes(query)) return false;
    return true;
  });
}

export function dashboardView(state, s) {
  const slices = s.byCategory
    .filter((row) => row.category.kind !== 'saving' && row.spent > 0)
    .map((row) => ({ label: row.category.name, value: row.spent, colour: CATEGORY_COLOURS[row.category.id] || '#888' }));
  const legend = slices
    .map(
      (slice) =>
        `<li><span class="dot" style="background:${slice.colour}"></span>${escapeHtml(slice.label)}<span class="legend-amount">${formatAbsCents(slice.value)}</span></li>`,
    )
    .join('');
  const recent = s.recent
    .map(
      (t) =>
        `<li><span class="tx-date">${monthDay(t.date)}</span><span class="tx-desc">${escapeHtml(t.description)}</span><span class="tx-amount ${t.amountCents < 0 ? 'out' : 'in'}">${t.amountCents < 0 ? '−' : '+'}${formatAbsCents(t.amountCents)}</span></li>`,
    )
    .join('');
  const bills = state.categories
    .filter((c) => c.fixed)
    .map(
      (c) =>
        `<li><span class="bill-name">${escapeHtml(c.name)}</span><span class="bill-day">day ${c.dueDay}</span><span class="bill-amount">${formatCents(c.budgetCents)}</span></li>`,
    )
    .join('');
  const goals = s.goals
    .map(
      (g) =>
        `<li class="goal-mini"><div class="goal-mini-head"><span>${escapeHtml(g.goal.name)}</span><span>${Math.round(g.pct * 100)}%</span></div>${goalBar(g.pct)}<div class="goal-mini-sub">${formatCents(g.goal.savedCents)} of ${formatCents(g.goal.targetCents)}${g.monthsLeft === 0 ? ' — reached' : ` · about ${g.monthsLeft} months left`}</div></li>`,
    )
    .join('');
  return `<section class="hero">
    <p class="eyebrow">${escapeHtml(state.household.month)} · ${escapeHtml(state.household.name)}</p>
    <h1>Your money, assigned before it is spent.</h1>
    <p class="lede">Hearth &amp; Ledger is a household budget that runs entirely in your browser. Income in, every dollar given a job, savings moved first — and nothing leaves this device.</p>
  </section>
  <section class="cards" aria-label="This month at a glance">
    <article class="card stat"><h2>Income</h2><p class="big">${formatCents(s.income)}</p><p class="sub">After tax, this month</p></article>
    <article class="card stat"><h2>Spent</h2><p class="big">${formatAbsCents(s.spentTotal)}</p><p class="sub"><span class="sub-line">Needs ${formatAbsCents(s.spentNeeds)}</span><span class="sub-line">Wants ${formatAbsCents(s.spentWants)}</span></p></article>
    <article class="card stat"><h2>Saved</h2><p class="big">${formatAbsCents(s.saved)}</p><p class="sub">${formatAbsCents(s.saved)} moved to savings</p></article>
    <article class="card stat highlight"><h2>Ready to assign</h2><p class="big">${formatCents(s.unassigned)}</p><p class="sub">${s.unassigned > 0 ? 'Give every dollar a job — see the budget' : 'Every dollar has a job'}</p><p><a class="button" href="#/budget">Open the budget</a></p></article>
  </section>
  <section class="grid-two">
    <article class="card">
      <h2>Where the spending went</h2>
      <div class="donut-wrap">${donutChart(slices, s.spentTotal, 'spent')}<ul class="legend">${legend}</ul></div>
      <p class="note">Needs and wants only — savings transfers are not spending.</p>
    </article>
    <article class="card">
      <h2>Envelopes running low</h2>
      ${s.lowEnvelopes.length === 0 ? '<p>Every envelope still has room.</p>' : `<ul class="envelopes">${s.lowEnvelopes
        .map(
          (row) =>
            `<li><span class="dot" style="background:${CATEGORY_COLOURS[row.category.id] || '#888'}"></span><span>${escapeHtml(row.category.name)}</span><span class="envelope-remaining ${row.remaining < 0 ? 'negative' : ''}">${row.remaining < 0 ? '−' : ''}${formatAbsCents(row.remaining)} left</span></li>`,
        )
        .join('')}</ul>`}
      <h2 class="subhead">Recurring bills</h2>
      <ul class="bills">${bills}</ul>
    </article>
  </section>
  <section class="grid-two">
    <article class="card">
      <h2>Recent transactions</h2>
      <ul class="tx-list">${recent}</ul>
      <p><a href="#/transactions">All transactions &rarr;</a></p>
    </article>
    <article class="card">
      <h2>Savings goals</h2>
      <ul class="goals-mini">${goals}</ul>
      <p><a href="#/goals">All goals &rarr;</a></p>
    </article>
  </section>`;
}

export function budgetView(state, s) {
  const groups = ['need', 'want', 'saving'].map((kind) => {
    const rows = s.byCategory.filter((row) => row.category.kind === kind);
    const totals = s.byKind[kind];
    return `<h2>${KIND_LABEL[kind]} — ${formatCents(totals.budget)} planned · ${formatAbsCents(totals.spent)} spent</h2>
    <table class="budget-table">
      <thead><tr><th>Category</th><th>Budget / month</th><th>Spent</th><th>Left</th><th>Used</th></tr></thead>
      <tbody>${rows.map(categoryRow).join('')}</tbody>
    </table>`;
  });
  const t = s.fifty;
  return `<h1>The budget</h1>
  <p class="lede">Every dollar of the ${formatCents(s.income)} coming in has a job. Edit any budget amount and the totals update at once; the money is saved in your browser.</p>
  <section class="cards">
    <article class="card stat"><h2>Planned</h2><p class="big">${formatCents(s.budgetTotal)}</p><p class="sub">Across ${state.categories.length} categories</p></article>
    <article class="card stat"><h2>Spent so far</h2><p class="big">${formatAbsCents(s.spentTotal)}</p><p class="sub">Needs and wants</p></article>
    <article class="card stat"><h2>Saved so far</h2><p class="big">${formatAbsCents(s.saved)}</p><p class="sub">Moved to savings</p></article>
    <article class="card stat highlight"><h2>Ready to assign</h2><p class="big">${formatCents(s.unassigned)}</p><p class="sub">${s.unassigned > 0 ? 'Unassigned income — give it a job below' : 'Every dollar has a job'}</p></article>
  </section>
  <section class="card rule-card">
    <h2>Against the 50/30/20 rule</h2>
    <p>On ${formatCents(s.income)} of take-home pay the rule aims for ${formatCents(t.needs)} needs, ${formatCents(t.wants)} wants and ${formatCents(t.savings)} savings. Your plan runs ${formatCents(s.byKind.need.budget)} needs, ${formatCents(s.byKind.want.budget)} wants and ${formatCents(s.byKind.saving.budget)} savings.</p>
    <ul class="rule-bars">
      <li><span class="rule-name">Needs — target 50%</span>${meterBar(s.byKind.need.budget / s.income, 0.5, '#1f6b52', s.byKind.need.budget > t.needs)}<span class="rule-figure">${s.byKind.need.share}% planned · target ${formatCents(t.needs)}</span></li>
      <li><span class="rule-name">Wants — target 30%</span>${meterBar(s.byKind.want.budget / s.income, 0.3, '#d97706', false)}<span class="rule-figure">${s.byKind.want.share}% planned · target ${formatCents(t.wants)}</span></li>
      <li><span class="rule-name">Savings — target 20%</span>${meterBar(s.byKind.saving.budget / s.income, 0.2, '#2563eb', false)}<span class="rule-figure">${s.byKind.saving.share}% planned · target ${formatCents(t.savings)}</span></li>
    </ul>
    <p class="note">Needs run ${formatCents(s.byKind.need.budget - t.needs)} over the 50% guide. That is common in an expensive month — the rule is a yardstick, not a verdict. <a href="#/planner">Try the planner</a> to see the trade-offs.</p>
  </section>
  ${groups.join('')}
  <p class="note">Budgets are monthly plans. Spending is what the transactions add up to. When an envelope is over, move money from another one — that is the budget working, not failing. <a href="#/guide">How the methods work</a>.</p>`;
}

export function transactionsView(state, s, ui = {}) {
  const filter = { query: ui.query || '', categoryId: ui.categoryId || '', direction: ui.direction || '' };
  const options = state.categories
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)} (${KIND_LABEL[c.kind]})</option>`)
    .join('');
  const shown = filterTransactions(s.transactions, filter);
  const rows = shown.map((t) => transactionRow(t, state.categories)).join('');
  const trendBars = s.weekly.map((week) => ({
    label: week.label,
    value: week.spentCents,
    colour: '#1f6b52',
  }));
  const trendRows = s.weekly
    .map((week) => `<tr><td>${escapeHtml(week.label)}</td><td class="num">${formatAbsCents(week.spentCents)}</td></tr>`)
    .join('');
  return `<h1>Transactions</h1>
  <p class="lede"><span id="tx-count">${shown.length} of ${s.transactions.length} transactions</span> in ${escapeHtml(state.household.month)} — ${formatCents(s.income)} in, ${formatAbsCents(s.spentTotal)} spent, ${formatAbsCents(s.saved)} saved. Add one and every total on the site updates.</p>
  <section class="card">
    <h2>Spending through the month</h2>
    <p>${escapeHtml(s.trendSummary)}</p>
    ${barChart(trendBars, s.trendSummary)}
    <details class="chart-table">
      <summary>Weekly figures as a table</summary>
      <table>
        <thead><tr><th>Week</th><th class="num">Spent</th></tr></thead>
        <tbody>${trendRows}</tbody>
      </table>
    </details>
  </section>
  <section class="card">
    <h2>Add a transaction</h2>
    <form data-action="add-transaction" class="form-grid">
      <label>Date <input type="date" name="date" value="2026-11-25" required></label>
      <label>Description <input type="text" name="description" maxlength="80" placeholder="e.g. Supermarket — weekly shop" required></label>
      <label>Category <select name="categoryId">${options}</select></label>
      <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" inputmode="decimal" placeholder="0.00" required></label>
      <fieldset class="radio-row"><legend>Direction</legend>
        <label><input type="radio" name="direction" value="out" checked> Money out</label>
        <label><input type="radio" name="direction" value="in"> Money in</label>
      </fieldset>
      <p class="form-note">Money out of a savings category counts as a transfer to savings, not spending.</p>
      <button class="button" type="submit">Add transaction</button>
    </form>
  </section>
  <section class="card">
    <h2>All transactions</h2>
    <form class="filter-row" data-action="filter-transactions">
      <label>Search <input type="search" name="query" id="tx-search" value="${escapeHtml(filter.query)}" placeholder="Search descriptions" aria-label="Search transaction descriptions"></label>
      <label>Category <select name="categoryId" id="tx-category" aria-label="Filter by category">
        <option value="">All categories</option>
        ${state.categories.map((c) => `<option value="${c.id}"${filter.categoryId === c.id ? ' selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
      </select></label>
      <label>Direction <select name="direction" id="tx-direction" aria-label="Filter by direction">
        <option value="">Money in and out</option>
        <option value="out"${filter.direction === 'out' ? ' selected' : ''}>Money out</option>
        <option value="in"${filter.direction === 'in' ? ' selected' : ''}>Money in</option>
      </select></label>
      <button class="button" type="button" data-action="export-csv">${exportLabel(shown.length)}</button>
    </form>
    <p class="note" id="tx-export-note">The download holds exactly the rows shown below — the search and filters apply to it too.</p>
    <table class="tx-table">
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr></thead>
      <tbody id="tx-table-body">${rows || '<tr><td colspan="5">No transactions match this filter.</td></tr>'}</tbody>
    </table>
  </section>`;
}

export function goalsView(state, s) {
  const cards = s.goals
    .map(
      (g) => `<article class="card goal-card">
      <h2>${escapeHtml(g.goal.name)}</h2>
      <p class="goal-note">${escapeHtml(g.goal.note)}</p>
      <p class="goal-figure"><span class="big">${formatCents(g.goal.savedCents)}</span> of ${formatCents(g.goal.targetCents)}</p>
      ${goalBar(g.pct)}
      <p>${Math.round(g.pct * 100)}% saved · ${formatCents(g.goal.monthlyCents)} a month</p>
      <p class="goal-finish">${g.monthsLeft === 0 ? 'Goal reached.' : g.monthsLeft === Infinity ? 'Set a monthly contribution to see a finish date.' : `About ${g.monthsLeft} months left — finished around ${g.finish}.`}</p>
      <form data-action="contribute-goal" class="goal-form">
        <input type="hidden" name="goalId" value="${g.goal.id}">
        <label>Add to this goal ($) <input type="number" name="amount" min="0.01" step="0.01" inputmode="decimal" placeholder="0.00" required></label>
        <button class="button" type="submit">Add</button>
      </form>
    </article>`,
    )
    .join('');
  return `<h1>Savings goals</h1>
  <p class="lede">Three goals, each with a target, a monthly contribution and a finish date the app works out from the numbers — no guessing. ${formatCents(s.saved)} has moved to savings this month.</p>
  <section class="goals-grid">${cards}</section>
  <section class="card">
    <h2>Add a goal</h2>
    <form data-action="add-goal" class="form-grid">
      <label>Goal name <input type="text" name="name" maxlength="60" placeholder="e.g. Holiday fund" required></label>
      <label>Target ($) <input type="number" name="target" min="1" step="0.01" inputmode="decimal" placeholder="0.00" required></label>
      <label>Monthly contribution ($) <input type="number" name="monthly" min="0" step="0.01" inputmode="decimal" placeholder="0.00" required></label>
      <label>Note <input type="text" name="note" maxlength="80" placeholder="What is it for?"></label>
      <button class="button" type="submit">Add goal</button>
    </form>
  </section>
  <section class="card">
    <h2>Emergency fund cover</h2>
    <p>Your emergency fund holds ${formatCents(s.emergencySaved)} — that covers <strong>${s.emergencyMonths} months</strong> of essential spending (${formatCents(s.byKind.need.budget)} a month). The guideline is three to six months; the fund's target of ${formatCents(s.emergencyTarget)} is three months of needs.</p>
    <p class="note">Retirement gets ${formatCents(s.retirementMonthly)} a month as an ongoing contribution — it has no finish date, because it is a habit, not a purchase.</p>
  </section>`;
}

export function plannerView(state, s) {
  const t = s.fifty;
  return `<h1>Planner</h1>
  <p class="lede">Four calculators, each doing one honest piece of arithmetic from numbers you type. Nothing here is a guess — the formulas are the methods themselves.</p>
  <section class="grid-two">
    <article class="card">
      <h2>50/30/20 calculator</h2>
      <p>Enter monthly take-home pay (after tax) and the rule splits it: at most 50% needs, at most 30% wants, at least 20% savings and extra debt payments.</p>
      <form data-action="calc-503020" class="form-grid">
        <label>Monthly take-home pay ($) <input type="number" name="income" min="1" step="0.01" inputmode="decimal" value="4800" required></label>
        <button class="button" type="submit">Work it out</button>
      </form>
      <div id="calc-503020-result" class="calc-result" aria-live="polite">
        <p>On ${formatCents(s.income)}: needs ${formatCents(t.needs)}, wants ${formatCents(t.wants)}, savings ${formatCents(t.savings)}.</p>
      </div>
    </article>
    <article class="card">
      <h2>Emergency fund calculator</h2>
      <p>Enter one month of essential spending (needs only). The guideline is three to six months of it, kept where you can reach it in a day.</p>
      <form data-action="calc-emergency" class="form-grid">
        <label>Monthly essential spending ($) <input type="number" name="essentials" min="1" step="0.01" inputmode="decimal" value="2865" required></label>
        <button class="button" type="submit">Work it out</button>
      </form>
      <div id="calc-emergency-result" class="calc-result" aria-live="polite">
        <p>Three months: ${formatCents(s.byKind.need.budget * 3)}. Six months: ${formatCents(s.byKind.need.budget * 6)}. Your fund covers ${s.emergencyMonths} months so far.</p>
      </div>
    </article>
  </section>
  <section class="card">
    <h2>What if I moved money to savings?</h2>
    <p>Try a trade-off before you live it: move a monthly amount out of wants, out of needs, or both, and see the new split against the 50/30/20 targets — and what the move adds up to over a year. The move cannot take more than the share holds.</p>
    <form data-action="calc-whatif" class="form-grid three-col">
      <label>Move from wants each month ($) <input type="number" name="fromWant" min="0" step="0.01" inputmode="decimal" value="100" required></label>
      <label>Move from needs each month ($) <input type="number" name="fromNeed" min="0" step="0.01" inputmode="decimal" value="0" required></label>
      <button class="button" type="submit">Work it out</button>
    </form>
    <div id="calc-whatif-result" class="calc-result" aria-live="polite">
      <p>Your plan now runs ${formatCents(s.byKind.need.budget)} needs (${s.byKind.need.share}%), ${formatCents(s.byKind.want.budget)} wants (${s.byKind.want.share}%) and ${formatCents(s.byKind.saving.budget)} savings (${s.byKind.saving.share}%), against targets of ${formatCents(t.needs)}, ${formatCents(t.wants)} and ${formatCents(t.savings)}.</p>
    </div>
  </section>
  <section class="card">
    <h2>When will I reach my goal?</h2>
    <p>Target minus what you have saved, divided by the monthly contribution, rounded up to whole months — a partial month still counts as a month.</p>
    <form data-action="calc-goal" class="form-grid three-col">
      <label>Target ($) <input type="number" name="target" min="1" step="0.01" inputmode="decimal" value="8600" required></label>
      <label>Already saved ($) <input type="number" name="saved" min="0" step="0.01" inputmode="decimal" value="3200" required></label>
      <label>Monthly contribution ($) <input type="number" name="monthly" min="0.01" step="0.01" inputmode="decimal" value="420" required></label>
      <button class="button" type="submit">Work it out</button>
    </form>
    <div id="calc-goal-result" class="calc-result" aria-live="polite">
      <p>On the sample numbers: ${formatCents(860000 - 320000)} left at ${formatCents(42000)} a month is 13 months — finished around December 2027.</p>
    </div>
  </section>
  <section class="card">
    <h2>Your household against the rule</h2>
    <p>Needs ${formatCents(s.byKind.need.budget)} (${s.byKind.need.share}% of income, target 50%), wants ${formatCents(s.byKind.want.budget)} (${s.byKind.want.share}%, target 30%), savings ${formatCents(s.byKind.saving.budget)} (${s.byKind.saving.share}%, target 20%). Needs run ${formatCents(s.byKind.need.budget - t.needs)} over the guide; wants run ${formatCents(t.wants - s.byKind.want.budget)} under it, which is what pays for the extra savings.</p>
  </section>`;
}

export function guideView() {
  const sections = GUIDE_SECTIONS.map(
    (section) => `<article class="card guide-section" id="${section.id}">
      <h2>${escapeHtml(section.title)}</h2>
      <p class="guide-source">Source: ${escapeHtml(section.source)}</p>
      ${section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
    </article>`,
  ).join('');
  const index = GUIDE_SECTIONS.map(
    (section) => `<li><a href="#/guide-${section.id}">${escapeHtml(section.title)}</a></li>`,
  ).join('');
  return `<h1>How to budget</h1>
  <p class="lede">Five methods, in plain language, with the numbers they actually use. Nothing here is invented: each one names its source, and the planner on this site runs the same arithmetic.</p>
  <nav class="guide-index" aria-label="Guide contents"><ul>${index}</ul></nav>
  ${sections}`;
}

export function notFoundView() {
  return `<h1>Not found</h1>
  <p>There is no page at this address. <a href="#/">Back to the dashboard</a>.</p>`;
}
