import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const themeRoot = path.resolve(__dirname, 'src');
const inputFile = path.resolve(themeRoot, 'assets/main.js');
const host = process.env.WP_VITE_HOST || '127.0.0.1';
const port = Number(process.env.WP_VITE_PORT || 5173);

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host,
    port,
    strictPort: true,
    origin: `http://${host}:${port}`,
    cors: {
      origin: '*',
      credentials: false,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    manifest: 'manifest.json',
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: inputFile,
    },
  },
  resolve: {
    alias: {
      '@': themeRoot,
    },
  },
});
