import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const themeRoot = path.resolve(__dirname, 'src');
const inputFiles = {
  main: path.resolve(themeRoot, 'assets/main.js'),
  blocks: path.resolve(themeRoot, 'blocks/index.js'),
};
const host = process.env.WP_VITE_HOST || '127.0.0.1';
const port = Number(process.env.WP_VITE_PORT || 5173);

function watchPhpReloadPlugin() {
  return {
    name: 'watch-php-full-reload',
    configureServer(server) {
      const phpGlob = path.resolve(themeRoot, '**/*.php');

      server.watcher.add(phpGlob);

      const triggerReload = (file) => {
        if (file.endsWith('.php')) {
          server.ws.send({
            type: 'full-reload',
            path: '*',
          });
        }
      };

      server.watcher.on('change', triggerReload);
      server.watcher.on('add', triggerReload);
      server.watcher.on('unlink', triggerReload);
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    watchPhpReloadPlugin(),
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
      input: inputFiles,
    },
  },
  resolve: {
    alias: {
      '@': themeRoot,
    },
  },
});
