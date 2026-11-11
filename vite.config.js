import { defineConfig } from 'vite';

// GitHub Pages serves this site at https://<user>.github.io/<repo>/,
// so production asset URLs need the "/<repo>/" prefix. Dev server stays at "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/google-sheets-3d-visualizer/' : '/',
}));
