import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, proxy API calls to the Express backend so the frontend can use
// relative '/api' paths with no CORS juggling.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      // Owner-uploaded dish photos live on the backend.
      '/uploads': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
    },
  },
});
