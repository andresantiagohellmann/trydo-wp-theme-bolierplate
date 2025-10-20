const fs = require('node:fs/promises');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputRoot = path.resolve(projectRoot, 'godev');

const IGNORE_DIRECTORIES = new Set([
	'.git',
	'node_modules',
	'dist',
	'production',
	'godev',
	'scaffold',
	'vendor',
	'.pnpm-store',
]);

const IGNORE_FILES = new Set([
	'.DS_Store',
	'package-lock.json',
	'yarn.lock',
	'production.log',
]);

const TRANSFORM_EXTENSIONS = new Set([
	'.php',
	'.js',
	'.jsx',
	'.ts',
	'.tsx',
	'.json',
	'.css',
	'.scss',
	'.md',
	'.html',
	'.cjs',
	'.mjs',
	'.xml',
]);

const dedupeWhitespace = (value) => value.replace(/\s+/g, ' ').trim();

const slugify = (value) =>
	dedupeWhitespace(value)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'new-theme';

const snakeCase = (value) => slugify(value).replace(/-/g, '_');

const constantCase = (value) => snakeCase(value).toUpperCase();

const titleCase = (value) =>
	dedupeWhitespace(value)
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

const ensureDirectory = async (dirPath) => {
	await fs.mkdir(dirPath, { recursive: true });
};

const copyDirectory = async (source, destination) => {
	const stats = await fs.stat(source);

	if (!stats.isDirectory()) {
		throw new Error(`Source path must be a directory: ${source}`);
	}

	await ensureDirectory(destination);

	const entries = await fs.readdir(source, { withFileTypes: true });

	for (const entry of entries) {
		if (IGNORE_DIRECTORIES.has(entry.name)) {
			continue;
		}

		const srcPath = path.join(source, entry.name);
		const destPath = path.join(destination, entry.name);

		if (entry.isDirectory()) {
			await copyDirectory(srcPath, destPath);
		} else {
			if (IGNORE_FILES.has(entry.name)) {
				continue;
			}

			await fs.copyFile(srcPath, destPath);
		}
	}
};

const walkFiles = async (dir) => {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await walkFiles(entryPath)));
		} else {
			files.push(entryPath);
		}
	}

	return files;
};

module.exports = function (plop) {
	plop.setGenerator('theme-clone', {
		description: 'Clone this starter theme into a new project',
		prompts: [
			{
				type: 'input',
				name: 'themeName',
				message: 'Theme name',
				default: 'New Project Theme',
			},
			{
				type: 'input',
				name: 'themeSlug',
				message: 'Theme slug (kebab-case)',
				default: (answers) => slugify(answers.themeName),
				validate: (input) => Boolean(slugify(input)) || 'Provide a valid slug',
				filter: (input) => slugify(input),
			},
			{
				type: 'input',
				name: 'themeDescription',
				message: 'Theme description',
				default: 'Custom WordPress FSE theme generated from Trydo starter.',
			},
			{
				type: 'input',
				name: 'themeVersion',
				message: 'Initial version',
				default: '0.1.0',
			},
			{
				type: 'input',
				name: 'authorName',
				message: 'Author name',
				default: 'Trydo',
			},
			{
				type: 'input',
				name: 'authorURI',
				message: 'Author URI',
				default: 'https://trydo.com.br',
			},
			{
				type: 'input',
				name: 'blockCategory',
				message: 'Custom block category title',
				default: (answers) => `${titleCase(answers.themeName)} Blocks`,
			},
			{
				type: 'input',
				name: 'blockCategorySlug',
				message: 'Custom block category slug',
				default: (answers) => `${slugify(answers.themeSlug)}-blocks`,
				filter: (input) => slugify(input),
			},
			{
				type: 'input',
				name: 'devHost',
				message: 'Local dev host (optional)',
				default: '127.0.0.1',
			},
			{
				type: 'input',
				name: 'devPort',
				message: 'Local dev port (optional)',
				default: '5173',
			},
		],
		actions: [
			async (answers) => {
				const slug = answers.themeSlug;
				const snake = snakeCase(slug);
				const constant = constantCase(slug);
				const title = titleCase(answers.themeName);
				const blockCategoryTitle = answers.blockCategory;
				const blockCategorySlug = answers.blockCategorySlug || `${slug}-blocks`;

				const destDir = path.join(outputRoot, slug);

				await ensureDirectory(outputRoot);

				let destExists = false;
				try {
					await fs.access(destDir);
					destExists = true;
				} catch {
					// does not exist
				}

				if (destExists) {
					throw new Error(`Destination already exists: ${destDir}`);
				}

				await copyDirectory(projectRoot, destDir);

				await fs.rm(path.join(destDir, 'docs'), { recursive: true, force: true });
				await fs.rm(path.join(destDir, 'production'), { recursive: true, force: true });

				const replacements = [
					{ search: /trydo-wp-theme-bolierplate/g, replace: slug },
					{ search: /trydo_wp_theme_bolierplate/g, replace: snake },
					{ search: /TRYDO_WP_THEME_BOLIERPLATE/g, replace: constant },
					{ search: /Trydo WP Theme Bolierplate/g, replace: title },
					{ search: /Trydo Blocks/g, replace: blockCategoryTitle },
					{ search: /trydo-blocks/g, replace: blockCategorySlug },
				];

				const files = await walkFiles(destDir);

				for (const filePath of files) {
					const ext = path.extname(filePath);
					if (!TRANSFORM_EXTENSIONS.has(ext)) {
						continue;
					}

					let content = await fs.readFile(filePath, 'utf-8');
					let modified = content;

					for (const { search, replace } of replacements) {
						modified = modified.replace(search, replace);
					}

					if (modified !== content) {
						await fs.writeFile(filePath, modified, 'utf-8');
					}
				}

				const styleHeader = `/*
Theme Name: ${title}
Theme URI: ${answers.authorURI}
Author: ${answers.authorName}
Author URI: ${answers.authorURI}
Description: ${answers.themeDescription}
Version: ${answers.themeVersion}
Requires at least: 6.6
Tested up to: 6.6
Requires PHP: 8.1
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: ${slug}
*/
`;
				await fs.writeFile(path.join(destDir, 'style.css'), styleHeader, 'utf-8');

				const readmePath = path.join(destDir, 'README.md');
				await fs.writeFile(
					readmePath,
					`# ${title}

This project was generated from the Trydo starter theme.

## Development

Install dependencies and start the dev server:

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Configure environment variables if needed (\`WP_VITE_HOST\`, \`WP_VITE_PORT\`).

## Production

Generate a production build and zip package:

\`\`\`bash
pnpm production
\`\`\`

## Notes
- Custom block category: ${blockCategoryTitle}
- Block category slug: ${blockCategorySlug}
- Text domain: ${slug}
- PHP prefix: ${snake}
`,
					'utf-8',
				);

				const envExample = `WP_VITE_HOST=${answers.devHost}
WP_VITE_PORT=${answers.devPort}
`;
				await fs.writeFile(path.join(destDir, '.env.example'), envExample, 'utf-8');

				const packagePath = path.join(destDir, 'package.json');
				try {
					const pkgRaw = await fs.readFile(packagePath, 'utf-8');
					const pkg = JSON.parse(pkgRaw);
					pkg.name = slug;
					pkg.version = answers.themeVersion;
					pkg.description = answers.themeDescription;
					await fs.writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
				} catch (error) {
					throw new Error(`Failed to update package.json: ${error.message}`);
				}

				const composerPath = path.join(destDir, 'composer.json');
				try {
					const composerRaw = await fs.readFile(composerPath, 'utf-8');
					const composer = JSON.parse(composerRaw);
					composer.name = `${slug}/theme`;
					composer.description = answers.themeDescription;
					await fs.writeFile(composerPath, `${JSON.stringify(composer, null, 2)}\n`, 'utf-8');
				} catch (error) {
					throw new Error(`Failed to update composer.json: ${error.message}`);
				}

				const themeJsonPath = path.join(destDir, 'theme.json');
				try {
					const themeRaw = await fs.readFile(themeJsonPath, 'utf-8');
					const themeData = JSON.parse(themeRaw);
					if (themeData && typeof themeData === 'object') {
						themeData.version = answers.themeVersion;
						await fs.writeFile(themeJsonPath, `${JSON.stringify(themeData, null, 2)}\n`, 'utf-8');
					}
				} catch (error) {
					throw new Error(`Failed to update theme.json: ${error.message}`);
				}

				return `Created theme at ${destDir}`;
			},
		],
	});
};
