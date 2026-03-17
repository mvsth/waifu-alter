import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/waifualter/',
  plugins: [react()],
  server: {
    host: true,
  },
});
