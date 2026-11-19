import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = process.env.VITE_DEV_API || 'http://127.0.0.1:5055';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': API, '/uploads': API },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
  },
});
