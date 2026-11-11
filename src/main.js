import './style.css';
import { config } from './config.js';
import { initAuth, getCurrentUser, signOut } from './auth.js';
import { loadPeople } from './sheets.js';

const loginView = document.querySelector('#login-view');
const appView = document.querySelector('#app-view');
const loginError = document.querySelector('#login-error');
const statusText = document.querySelector('#status');

async function loadData() {
  statusText.textContent = 'Loading data from Google Sheets…';
  statusText.hidden = false;
  try {
    const people = await loadPeople({
      sheetId: config.sheetId,
      range: config.sheetRange,
      apiKey: config.googleApiKey,
    });
    console.table(people.slice(0, 5)); // peek at the first few in DevTools
    statusText.textContent = `Loaded ${people.length} people.`;
    // Step 6+: build the 3D scene with `people` here.
  } catch (error) {
    statusText.textContent = error.message;
  }
}

function showLogin() {
  appView.hidden = true;
  loginView.hidden = false;
}

function showApp(user) {
  document.querySelector('#user-avatar').src = user.picture;
  document.querySelector('#user-name').textContent = user.name;
  loginView.hidden = true;
  appView.hidden = false;
  loadData();
}

function showError(message) {
  loginError.textContent = message;
  loginError.hidden = false;
}

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
