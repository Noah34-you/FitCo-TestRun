import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Builds the app for the site root. After `npm run build`, copy
// dist/index.html, dist/assets/ and dist/media/ into the repo root
// (see scripts/promote.sh) — the static deployment serves them as /.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
