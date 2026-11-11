import { defineConfig } from 'vite';

// GitHub Pages serves the site from /<repo>/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/google-sheets-3d-visualizer/' : '/',
}));
