import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/waifu-alter/',
  plugins: [react()],
  server: {
    host: true,
  },
});
