const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

const COLUMNS = {
  name: 'Name',
  photo: 'Photo',
  age: 'Age',
  country: 'Country',
  interest: 'Interest',
  netWorth: 'Net Worth',
};

export async function fetchSheetRows({ sheetId, range, apiKey }) {
  const url =
    `${SHEETS_API_URL}/${encodeURIComponent(sheetId)}` +
    `/values/${encodeURIComponent(range)}?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = body.error?.message ?? response.statusText;
    throw new Error(`Could not load sheet data (${response.status}): ${reason}`);
  }
  return body.values ?? [];
}

// e.g. "$251,260.80" becomes 251260.8
export function parseMoney(text) {
  const value = Number(String(text ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

export function rowsToPeople(rows) {
  const [header = [], ...dataRows] = rows;
  const normalisedHeader = header.map((cell) => cell.trim().toLowerCase());

  // Columns are matched by header name, so their order in the sheet doesn't matter.
  const index = {};
  for (const [key, title] of Object.entries(COLUMNS)) {
    index[key] = normalisedHeader.indexOf(title.toLowerCase());
    if (index[key] === -1) throw new Error(`Column "${title}" not found in the sheet header.`);
  }

  const cell = (row, key) => (row[index[key]] ?? '').trim();

  return dataRows
    .filter((row) => cell(row, 'name') !== '')
    .map((row) => ({
      name: cell(row, 'name'),
      photo: cell(row, 'photo'),
      age: Number.parseInt(cell(row, 'age'), 10) || null,
      country: cell(row, 'country'),
      interest: cell(row, 'interest'),
      netWorth: parseMoney(cell(row, 'netWorth')),
    }));
}

export async function loadPeople(options) {
  return rowsToPeople(await fetchSheetRows(options));
}
