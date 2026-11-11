// These values are bundled into the client, so only non-secret config belongs here.

const env = import.meta.env;

export const config = Object.freeze({
  googleClientId: env.VITE_GOOGLE_CLIENT_ID,
  googleApiKey: env.VITE_GOOGLE_API_KEY,
  sheetId: env.VITE_SHEET_ID,
  sheetRange: env.VITE_SHEET_RANGE ?? 'Data!A1:F201',
});

const missing = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(
    `Missing config: ${missing.join(', ')}. Copy .env.example to .env.local and fill it in.`,
  );
}
