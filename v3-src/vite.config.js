import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Builds the V3 app into the repo's /v3 folder so the existing static
// deployment serves it with zero config changes.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/v3/',
  build: {
    outDir: '../v3',
    emptyOutDir: true,
  },
});
