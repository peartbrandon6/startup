import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/chat': {
        target: 'ws://localhost:4000',
        ws: true,
      },
      '/api': 'http://localhost:4000',
    },
  },
});