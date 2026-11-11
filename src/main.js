import './style.css';
import { config } from './config.js';
import { initAuth, getCurrentUser, signOut } from './auth.js';
import { loadPeople } from './sheets.js';
import { createTile } from './tiles.js';
import { createScene } from './scene.js';
import { tableLayout, sphereLayout, helixLayout, gridLayout } from './layouts.js';

const loginView = document.querySelector('#login-view');
const appView = document.querySelector('#app-view');
const loginError = document.querySelector('#login-error');
const statusText = document.querySelector('#status');
const menu = document.querySelector('#menu');
const container = document.querySelector('#container');

let visualizer = null; // the current 3D scene, so we can dispose it on sign-out
let layouts = {};

function setStatus(message) {
  statusText.textContent = message ?? '';
  statusText.hidden = !message;
}

async function startVisualizer() {
  setStatus('Loading data from Google Sheets…');
  try {
    const people = await loadPeople({
      sheetId: config.sheetId,
      range: config.sheetRange,
      apiKey: config.googleApiKey,
    });

    visualizer?.dispose();
    visualizer = createScene({ container, elements: people.map(createTile) });

    const count = people.length;
    layouts = {
      table: tableLayout(count),
      sphere: sphereLayout(count),
      helix: helixLayout(count),
      grid: gridLayout(count),
    };

    setStatus(null);
    menu.hidden = false;
    visualizer.transformTo(layouts.table);
  } catch (error) {
    setStatus(error.message);
  }
}

function stopVisualizer() {
  visualizer?.dispose();
  visualizer = null;
  menu.hidden = true;
}

function showLogin() {
  stopVisualizer();
  appView.hidden = true;
  loginView.hidden = false;
}

function showApp(user) {
  document.querySelector('#user-avatar').src = user.picture;
  document.querySelector('#user-name').textContent = user.name;
  loginView.hidden = true;
  appView.hidden = false;
  startVisualizer();
}

function showError(message) {
  loginError.textContent = message;
  loginError.hidden = false;
}

// Layout buttons: <button data-layout="sphere"> → layouts.sphere
menu.addEventListener('click', (event) => {
  const name = event.target.closest('button[data-layout]')?.dataset.layout;
  if (name && visualizer) visualizer.transformTo(layouts[name]);
});

document.querySelector('#sign-out').addEventListener('click', () => {
  signOut();
  showLogin();
});

async function start() {
  // Already signed in during this tab session? Skip the login screen.
  const existingUser = getCurrentUser();
  if (existingUser) showApp(existingUser);

  try {
    await initAuth({
      clientId: config.googleClientId,
      buttonContainer: document.querySelector('#google-button'),
      onSignIn: showApp,
    });
  } catch (error) {
    showError(error.message);
  }
}

start();
