import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import os from 'node:os';

const PORT = Number(process.env.VITE_PORT) || 5002;
const HOSTNAME = process.env.VITE_PUBLIC_HOSTNAME || os.hostname();

// Put the CSS straight into index.html in the production build, so the
// browser does not wait for a separate stylesheet before showing the page
function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const html = bundle['index.html'];
      for (const [name, file] of Object.entries(bundle)) {
        if (!name.endsWith('.css')) continue;
        const link = new RegExp(`<link rel="stylesheet"[^>]*href="/${name}"[^>]*>`);
        if (!link.test(html.source)) continue;
        html.source = html.source.replace(link, () => `<style>${file.source}</style>`);
        delete bundle[name];
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss()],
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
  preview: {
    host: '0.0.0.0',
    port: PORT,
    strictPort: true,
    allowedHosts: ['.labs.decoded.com'],
  },
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'tests/integration/**'],
    setupFiles: ['./src/__tests__/setup.js'],
  },
});
