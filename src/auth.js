const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const STORAGE_KEY = 'gs3d.user';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google Sign-In. Check your connection.'));
    document.head.appendChild(script);
  });
}

// Decodes the payload only. The signature is not verified since there is no backend.
function decodeJwtPayload(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function getCurrentUser() {
  try {
    const user = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (user && user.expiresAt > Date.now()) return user;
  } catch {
    // Ignore malformed session data.
  }
  sessionStorage.removeItem(STORAGE_KEY);
  return null;
}

/**
 * @param {object} options
 * @param {string} options.clientId - OAuth Client ID from Google Cloud
 * @param {HTMLElement} options.buttonContainer - where to draw the button
 * @param {(user: object) => void} options.onSignIn - called after a successful sign-in
 */
export async function initAuth({ clientId, buttonContainer, onSignIn }) {
  await loadGoogleScript();

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: ({ credential }) => {
      const payload = decodeJwtPayload(credential);

      const validIssuer = ['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss);
      if (!validIssuer || payload.aud !== clientId) {
        throw new Error('Unexpected sign-in token.');
      }

      const user = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        expiresAt: payload.exp * 1000, // exp is in seconds
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      onSignIn(user);
    },
  });

  window.google.accounts.id.renderButton(buttonContainer, {
    theme: 'filled_blue',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left',
  });
}

export function signOut() {
  sessionStorage.removeItem(STORAGE_KEY);
  window.google?.accounts?.id?.disableAutoSelect();
}
