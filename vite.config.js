import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const themeRoot = path.resolve(__dirname, 'src');
const inputFiles = {
	main: path.resolve(themeRoot, 'resources/scripts/main.js'),
	blocks: path.resolve(themeRoot, 'blocks/index.js'),
	editor: path.resolve(themeRoot, 'resources/scripts/editor.js'),
	vendors: path.resolve(themeRoot, 'resources/scripts/vendors.js'),
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

function watchBlockScriptsPlugin() {
	return {
		name: 'watch-block-scripts-reload',
		configureServer(server) {
			// Watch interactive.js and view.js files in blocks
			const interactiveGlob = path.resolve(themeRoot, 'blocks/*/interactive.js');
			const viewGlob = path.resolve(themeRoot, 'blocks/*/view.js');

			server.watcher.add([interactiveGlob, viewGlob]);

			const triggerReload = (file) => {
				// Only reload if it's a block script file
				if (
					file.includes('/blocks/') &&
					(file.endsWith('/interactive.js') || file.endsWith('/view.js'))
				) {
					console.log(
						`[HMR] Block script changed: ${path.basename(path.dirname(file))}/${path.basename(file)}`
					);
					server.ws.send({
						type: 'full-reload',
						path: '*',
					});
				}
			};

			server.watcher.on('change', triggerReload);
		},
	};
}

export default defineConfig({
	plugins: [tailwindcss(), watchPhpReloadPlugin(), watchBlockScriptsPlugin()],
	base:
		process.env.NODE_ENV === 'production'
			? '/wp-content/themes/trydo-wp-theme-bolierplate/dist/'
			: '/',
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
