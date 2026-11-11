# Google Sheets 3D Visualizer

An interactive 3D visualisation of people data stored in Google Sheets, built on the three.js
[CSS3D periodic table](https://threejs.org/examples/#css3d_periodictable) demo and protected by Google Sign-In.

**Live demo:** https://a5y3r.github.io/google-sheets-3d-visualizer/

## Features

- **Sign in with Google** (Google Identity Services) before the visualisation is shown
- **Live data from Google Sheets** via the Sheets API v4, no hard-coded data
- **Person tiles** showing country, age, photo, name and interest
- **Tiles coloured by net worth:** red under $100K, orange $100K–$200K, green over $200K, with a Low → High legend
- **Four animated layouts:**
  - **Table**: 20 × 10
  - **Sphere**
  - **Helix**: a double helix (two strands, 180° apart)
  - **Grid**: 5 × 4 × 10 (5 across, 4 down, 10 deep)
- Mouse controls: drag to rotate, scroll to zoom, right-drag to pan

## Tech stack

| | |
|---|---|
| Rendering | [three.js](https://threejs.org/) `CSS3DRenderer`, `TrackballControls`, tween.js |
| Auth | [Google Identity Services](https://developers.google.com/identity/gsi/web) |
| Data | [Google Sheets API v4](https://developers.google.com/sheets/api) |
| Tooling | [Vite](https://vite.dev/), [Vitest](https://vitest.dev/), plain JavaScript (ES modules) |
| Hosting | GitHub Pages, deployed by GitHub Actions |

## Project structure

```
src/
├── main.js      App entry: connects auth, data, tiles, scene and UI
├── config.js    Reads and validates environment variables
├── auth.js      Google Sign-In (load GIS, decode ID token, session)
├── sheets.js    Fetch rows from the Sheets API → typed person objects
├── tiles.js     Person → tile element; net worth → colour level
├── layouts.js   Pure maths: target positions for Table / Sphere / Helix / Grid
├── scene.js     three.js camera, CSS3D renderer, controls, tween animation
└── style.css
tests/           Vitest unit tests for sheets, tiles and layouts
public/          Static files (favicon, privacy policy)
```

Each module has one job. `layouts.js`, `sheets.js` (parsing) and `tiles.js` (`netWorthLevel`) contain
pure functions with no DOM or network access, so they are unit-tested directly.

## How it works

1. `auth.js` renders the Google button. When the user signs in, Google returns an ID token (a JWT). The app
   decodes it, checks the issuer and audience, and keeps the name, email and photo in `sessionStorage`.
2. `sheets.js` calls `spreadsheets.values.get` with a restricted API key, finds the columns by header name
   (so the column order in the Sheet doesn't matter) and converts the values, e.g. `"$251,260.80"` → `251260.8`.
3. `tiles.js` builds one HTML tile per person. `scene.js` wraps each tile in a `CSS3DObject`.
4. Each layout function returns one target position and rotation per tile. Switching layout tweens every tile
   from where it is to its target, with slightly random durations for an organic motion.

## Design decisions and trade-offs

- **API key + public-read Sheet, instead of the user's OAuth token.** Reading Sheets with the user's token
  needs a *sensitive* OAuth scope, which brings Google app verification and a warning screen for unverified
  apps. The data here is non-sensitive sample data, so the Sheet is shared as "anyone with the link can view"
  and read with an API key restricted to the **Sheets API** and to **this site's domain** (HTTP referrer).
  Sign-in still controls access to the page.
- **Client-side sign-in only.** There is no backend, so the ID token is decoded and sanity-checked
  (`iss`, `aud`, `exp`) but its signature is not verified. That is fine for gating a demo; a production app
  would verify the token on a server.
- **Public config values.** The OAuth Client ID and the restricted API key are bundled into the JavaScript.
  Neither is a secret: the Client ID only works on the listed origins, and the key only works for the Sheets
  API from this domain.
- **Net worth boundaries.** The brief says "Red < $100K, Orange > $100K, Green > $200K", which doesn't cover
  exactly $100K or $200K. Chosen rule: `< 100,000` red, `100,000–200,000` (inclusive) orange, `> 200,000` green.
- **Grid dimensions.** "5 × 4 × 10" is read as x × y × z: 5 columns across, 4 rows down and 10 layers deep.
  The grid is centred on the origin, and the layer spacing is tuned so the nearest layer still fits on screen
  and every layer stays in front of the camera. (The original demo grid puts layers behind the camera when
  there are 200 items.)
- **Double helix tuning.** Strands are rotated π apart, and the pitch is chosen so the gap between strands is
  larger than a tile's height. Otherwise the two strands visually merge into one dense coil.
- **Safety.** Sheet values are inserted with `textContent`, never `innerHTML`, to prevent HTML injection.

## Running locally

Requirements: Node.js 20.19+ (or 22.12+).

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev                  # http://localhost:5173
npm test                     # run the unit tests
npm run build                # production build in dist/
```

### Environment variables

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID (Web application) |
| `VITE_GOOGLE_API_KEY` | API key restricted to the Google Sheets API and your site's domain |
| `VITE_SHEET_ID` | ID of the Google Sheet (the part of its URL between `/d/` and `/edit`) |
| `VITE_SHEET_RANGE` | Range to read, e.g. `Data!A1:F201` |

### Google Cloud setup

1. Create a Google Cloud project and enable the **Google Sheets API**.
2. Configure the **Google Auth Platform** (consent screen): External audience, app name and support email.
3. Create an **OAuth client ID** (Web application) and add your origins under *Authorized JavaScript origins*
   (e.g. `http://localhost:5173` and `https://<user>.github.io`).
4. Create an **API key**, restricted to the Google Sheets API and to your site's referrers
   (e.g. `http://localhost:5173/*` and `https://<user>.github.io/*`).
5. Import the data CSV into a Google Sheet, name the tab `Data` and share it as *Anyone with the link: Viewer*.

## Deployment

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which installs
dependencies, runs the tests, builds with the environment variables from the repository's
**Actions variables**, and deploys `dist/` to GitHub Pages.
