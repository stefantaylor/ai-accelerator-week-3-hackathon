import { defineConfig } from 'vite';
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
  // GOV.UK Frontend's CSS contains an old IE-only hack that LightningCSS
  // rejects. errorRecovery drops just those rules.
  css: {
    lightningcss: { errorRecovery: true },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
  },
});
