// Hearth & Ledger — CSV export for repository iosai2035/best-household-budget-site-20261126.
// Everything happens in the browser: the rows the user sees are serialised to
// RFC 4180 CSV, wrapped in a Blob and downloaded with a temporary link, so the
// data never leaves the device. A field that contains a comma, a quote or a
// line break is wrapped in double quotes with its quotes doubled; a field
// that starts with =, +, - or @ gets a leading single quote so a spreadsheet
// cannot read it as a formula (the OWASP CSV-injection rule). A UTF-8 byte
// order mark is prepended so Excel on Windows reads the text correctly.

// One CSV field, escaped the RFC 4180 way.
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

// The transactions as CSV text: a header row, then one row each, newest first
// (the order the table shows). Amounts are plain dollars with two decimals and
// a minus sign for money out, so a spreadsheet can sum the column directly.
// Text fields go through csvCell; the amount is a number the app builds, not
// user text, so it is written bare — csvCell would neutralise its leading
// minus as a formula and turn every money-out row into text.
export function transactionsToCsv(transactions, categories) {
  const lines = ['Date,Description,Category,Kind,Amount'];
  for (const t of transactions) {
    const category = categories.find((c) => c.id === t.categoryId);
    const fields = [t.date, t.description, category ? category.name : '', category ? category.kind : ''].map(csvCell);
    lines.push([...fields, (t.amountCents / 100).toFixed(2)].join(','));
  }
  return lines.join('\r\n') + '\r\n';
}

// Offer a CSV string as a file download and free the object URL afterwards.
// The filename carries the month, so repeated exports do not overwrite each
// other silently.
export function downloadCsv(csvText, filename) {
  const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return blob.size;
}

// A short human label for the export button, e.g. "Download 38 transactions".
export function exportLabel(count) {
  return `Download ${count} transaction${count === 1 ? '' : 's'} as CSV`;
}

// The amount column of the CSV, for the arithmetic check: the file's amounts
// must add back to the month's income minus spending minus savings.
export function csvAmountTotal(transactions) {
  return transactions.reduce((total, t) => total + t.amountCents, 0);
}
