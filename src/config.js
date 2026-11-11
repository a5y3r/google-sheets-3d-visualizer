// Single place that reads environment variables.
// Vite replaces import.meta.env.VITE_* at build time, so these values
// end up in the public bundle — only non-secret values belong here.

const env = import.meta.env;

export const config = Object.freeze({
  googleClientId: env.VITE_GOOGLE_CLIENT_ID,
  googleApiKey: env.VITE_GOOGLE_API_KEY,
  sheetId: env.VITE_SHEET_ID,
  sheetRange: env.VITE_SHEET_RANGE ?? 'Data!A1:F201',
});

// Fail fast with a clear message instead of a confusing error later.
const missing = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(
    `Missing config: ${missing.join(', ')}. Copy .env.example to .env.local and fill it in.`,
  );
}
