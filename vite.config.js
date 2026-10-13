import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import os from 'node:os';

const PORT = Number(process.env.VITE_PORT) || 5002;
const HOSTNAME = process.env.VITE_PUBLIC_HOSTNAME || os.hostname();

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: PORT,
    strictPort: true,
    allowedHosts: ['.labs.decoded.com'],
    hmr: {
      protocol: 'wss',
      host: HOSTNAME,

      clientPort: 443,
    },
  },
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'tests/integration/**'],
    setupFiles: ['./src/__tests__/setup.js'],
  },
});
