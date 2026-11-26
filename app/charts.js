// Hearth & Ledger — charts for repository iosai2035/best-household-budget-site-20261126.
// Hand-built SVG, no library: a donut of spending by category, a bar chart of
// spending through the month, and the bars the budget and planner pages use.
// Every chart is a string of SVG the views drop into the page, with a text
// fallback (a table of the same figures) beside it, so the numbers are readable
// even where SVG is not. A chart that carries meaning gets role="img" and a
// title that names what the data says, not just what shape it is.

import { formatAbsCents } from './money.js';

// One colour per category, in the same order the budget page lists them.
export const CATEGORY_COLOURS = {
  housing: '#1f6b52',
  groceries: '#4c9a7a',
  utilities: '#7fb89e',
  transport: '#2f7ea8',
  insurance: '#5b8a72',
  phone: '#8aa8a0',
  health: '#3e7d6b',
  childcare: '#146b4f',
  dining: '#d97706',
  entertainment: '#e8a33d',
  subscriptions: '#c2703d',
  clothing: '#b45309',
  hobbies: '#e0a458',
  gifts: '#a16207',
  emergency: '#2563eb',
  vacation: '#4f83e3',
  car: '#1d4ed8',
  retirement: '#6d8fd4',
};

function polar(cx, cy, radius, angleDegrees) {
  const angle = ((angleDegrees - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

// A donut of slices: [{ label, value, colour }], with values and total in
// integer cents. The centre shows the formatted total. Values of zero are
// skipped; a single slice becomes a full ring.
export function donutChart(slices, totalCents, centreLabel) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outer = 88;
  const inner = 57;
  const shown = slices.filter((s) => s.value > 0);
  const totalLabel = formatAbsCents(totalCents);
  if (shown.length === 0) {
    return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${centreLabel}: no spending yet">
      <circle cx="${cx}" cy="${cy}" r="${(outer + inner) / 2}" fill="none" style="stroke:var(--line)" stroke-width="${outer - inner}"/>
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-total">$0</text>
      <text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-label">${centreLabel}</text>
    </svg>`;
  }
  let angle = 0;
  const paths = shown.map((slice) => {
    const share = slice.value / totalCents;
    const sweep = share * 360;
    const large = sweep > 180 ? 1 : 0;
    const [x1, y1] = polar(cx, cy, outer, angle);
    const [x2, y2] = polar(cx, cy, outer, angle + sweep);
    const [x3, y3] = polar(cx, cy, inner, angle + sweep);
    const [x4, y4] = polar(cx, cy, inner, angle);
    angle += sweep;
    const path =
      sweep >= 359.99
        ? `<circle cx="${cx}" cy="${cy}" r="${(outer + inner) / 2}" fill="none" stroke="${slice.colour}" stroke-width="${outer - inner}"/>`
        : `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outer} ${outer} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${inner} ${inner} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z" fill="${slice.colour}"/>`;
    return path;
  });
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${centreLabel} by category">
    ${paths.join('')}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-total">${totalLabel}</text>
    <text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-label">${centreLabel}</text>
  </svg>`;
}

// A bar chart of bars: [{ label, value, colour }], values in integer cents.
// Bars are drawn from a baseline with a real text value above each one, and
// the chart's title says what the tallest bar is, so the picture and the words
// agree. The caller puts the same figures in a table beside it, which is the
// chart's text alternative. Zero bars still draw, at zero height, so a quiet
// week reads as a quiet week and not as a missing one.
export function barChart(bars, summary) {
  const width = 560;
  const height = 210;
  const baseline = 172;
  const top = 30;
  const gap = 14;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const slot = (width - gap * 2) / bars.length;
  const barWidth = Math.min(64, slot * 0.62);
  // A deterministic id, built from the bar labels, so two renders of the same
  // chart produce the same markup.
  const titleId = `bar-chart-${bars.map((b) => b.label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()).join('-')}`;
  const rects = bars
    .map((bar, i) => {
      const barHeight = (bar.value / max) * (baseline - top);
      const x = gap + slot * i + (slot - barWidth) / 2;
      const y = baseline - barHeight;
      const labelY = baseline + 22;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${Math.max(0, barHeight).toFixed(1)}" rx="3" fill="${bar.colour}"/>
      <text x="${(x + barWidth / 2).toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle" class="bar-value">${formatAbsCents(bar.value)}</text>
      <text x="${(x + barWidth / 2).toFixed(1)}" y="${labelY}" text-anchor="middle" class="bar-label">${bar.label}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${titleId}" class="bar-chart">
    <title id="${titleId}">${summary}</title>
    <line x1="${gap}" y1="${baseline}" x2="${width - gap}" y2="${baseline}" class="bar-baseline"/>
    ${rects}
  </svg>`;
}

// One horizontal bar: a track, a filled portion, and a marker for the target.
// width is the bar's share of its scale (0..1); marker is the target's share.
export function meterBar(width, marker, fillColour, over) {
  const pct = Math.max(0, Math.min(1, width)) * 100;
  const mark = Math.max(0, Math.min(1, marker)) * 100;
  return `<div class="meter" role="img" aria-label="${Math.round(pct)} percent of budget used">
    <div class="meter-track"><div class="meter-fill${over ? ' over' : ''}" style="width:${pct.toFixed(1)}%;background:${fillColour}"></div></div>
    <div class="meter-marker" style="left:${mark.toFixed(1)}%"></div>
  </div>`;
}

// A thin progress bar for a savings goal: filled share of the target.
export function goalBar(share) {
  const pct = Math.max(0, Math.min(100, share * 100));
  return `<div class="goal-track" role="img" aria-label="${pct.toFixed(0)} percent of the goal saved">
    <div class="goal-fill" style="width:${pct.toFixed(1)}%"></div>
  </div>`;
}
