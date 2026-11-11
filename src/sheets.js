// Load people from Google Sheets via the Sheets API v4 (values.get).
// Docs: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get

const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Sheet header text → property name in our objects.
const COLUMNS = {
  name: 'Name',
  photo: 'Photo',
  age: 'Age',
  country: 'Country',
  interest: 'Interest',
  netWorth: 'Net Worth',
};

/** Fetch the raw cell values: an array of rows, each row an array of strings. */
export async function fetchSheetRows({ sheetId, range, apiKey }) {
  const url =
    `${SHEETS_API_URL}/${encodeURIComponent(sheetId)}` +
    `/values/${encodeURIComponent(range)}?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url);
  const body = await response.json().catch(() => ({})); // error bodies may not be JSON

  if (!response.ok) {
    const reason = body.error?.message ?? response.statusText;
    throw new Error(`Could not load sheet data (${response.status}): ${reason}`);
  }
  return body.values ?? [];
}

/** "$251,260.80" → 251260.8  (strips everything except digits, dot and minus) */
export function parseMoney(text) {
  const value = Number(String(text ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

/** Turn raw rows (first row = header) into clean person objects. */
export function rowsToPeople(rows) {
  const [header = [], ...dataRows] = rows;
  const normalisedHeader = header.map((cell) => cell.trim().toLowerCase());

  // Find each column's index by its header name, so column order doesn't matter.
  const index = {};
  for (const [key, title] of Object.entries(COLUMNS)) {
    index[key] = normalisedHeader.indexOf(title.toLowerCase());
    if (index[key] === -1) throw new Error(`Column "${title}" not found in the sheet header.`);
  }

  const cell = (row, key) => (row[index[key]] ?? '').trim();

  return dataRows
    .filter((row) => cell(row, 'name') !== '') // skip blank rows
    .map((row) => ({
      name: cell(row, 'name'),
      photo: cell(row, 'photo'),
      age: Number.parseInt(cell(row, 'age'), 10) || null,
      country: cell(row, 'country'),
      interest: cell(row, 'interest'),
      netWorth: parseMoney(cell(row, 'netWorth')),
    }));
}

/** Convenience: fetch + parse in one call. */
export async function loadPeople(options) {
  return rowsToPeople(await fetchSheetRows(options));
}
