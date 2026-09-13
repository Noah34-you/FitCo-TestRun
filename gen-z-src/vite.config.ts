import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/gen-z/',
  plugins: [react()],
  build: {
    outDir: '../gen-z',
    emptyOutDir: true,
  },
  server: {
    port: 4174,
  },
})
