const { spawnSync } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const IGNORE_DIRECTORIES = new Set([
	'.git',
	'.husky',
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
	'pnpm-lock.yaml',
	'yarn.lock',
	'package-lock.json',
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
	'.txt',
]);

const dedupeWhitespace = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const slugify = (value) =>
	dedupeWhitespace(value)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'new-theme';

const snakeCase = (value) => slugify(value).replace(/-/g, '_');
const constantCase = (value) => snakeCase(value).toUpperCase();
const pascalCase = (value) =>
	slugify(value)
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');
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
	const entries = await fs.readdir(source, { withFileTypes: true });
	await ensureDirectory(destination);

	for (const entry of entries) {
		const srcPath = path.join(source, entry.name);
		const destPath = path.join(destination, entry.name);

		if (entry.isDirectory()) {
			if (IGNORE_DIRECTORIES.has(entry.name)) {
				continue;
			}
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
	const queue = [dir];
	const files = [];

	while (queue.length) {
		const current = queue.pop();
		const entries = await fs.readdir(current, { withFileTypes: true });

		for (const entry of entries) {
			const entryPath = path.join(current, entry.name);
			if (entry.isDirectory()) {
				queue.push(entryPath);
			} else {
				files.push(entryPath);
			}
		}
	}

	return files;
};

const writeJson = async (filePath, data) => {
	await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
};

const createDocs = async (destDir, answers) => {
	const docsDir = path.join(destDir, 'docs');
	await fs.rm(docsDir, { recursive: true, force: true });
	await fs.mkdir(docsDir, { recursive: true });
	const content = `# ${answers.title}\n\nGenerated from the Trydo starter theme.\n\n## Overview\n\n- Slug: ${answers.slug}\n- Text domain: ${answers.slug}\n- PHP namespace prefix: ${answers.namespace}\n- Block category: ${answers.blockCategoryTitle} (${answers.blockCategorySlug})\n\n## Development\n\n- \`pnpm install\`\n- \`pnpm dev\`\n\n## Production\n\n- \`pnpm production\`\n\nFor detailed architecture, refer to the original boilerplate documentation.`;
	await fs.writeFile(path.join(docsDir, 'ARCHITECTURE.md'), content, 'utf8');
};

module.exports = function (plop) {
	plop.setGenerator('theme-clone', {
		description: 'Clone this starter theme into a new project',
		prompts: [
			{
				type: 'input',
				name: 'slug',
				message: 'Theme slug (kebab-case)',
				default: 'my-new-theme',
				filter: slugify,
				validate: (value) =>
					/^[a-z][a-z0-9-]+$/.test(value) ||
						'Utilize apenas letras minúsculas, números e hífens (kebab-case).',
			},
			{
				type: 'input',
				name: 'title',
				message: 'Theme name (human readable)',
				default: (answers) => titleCase(answers.slug.replace(/-/g, ' ')),
			},
			{
				type: 'input',
				name: 'namespace',
				message: 'PHP prefix (snake_case)',
				default: (answers) => snakeCase(answers.slug),
				filter: (value) => snakeCase(value || ''),
				validate: (value) =>
					/^[a-z][a-z0-9_]*$/.test(value) ||
						'Use snake_case iniciando com letra (ex: my_theme).',
			},
			{
				type: 'input',
				name: 'authorName',
				message: 'Author name',
				default: 'Trydo Team',
			},
			{
				type: 'input',
				name: 'authorURI',
				message: 'Author URI',
				default: 'https://trydo.com.br',
				validate: (value) => (!value || value.startsWith('http')) || 'Informe uma URL válida.',
			},
			{
				type: 'input',
				name: 'themeURI',
				message: 'Theme URI (opcional)',
				default: (answers) => answers.authorURI,
			},
			{
				type: 'input',
				name: 'description',
				message: 'Descrição do tema',
				default: 'Tema WordPress FSE gerado a partir do starter Trydo.',
			},
			{
				type: 'input',
				name: 'version',
				message: 'Versão inicial',
				default: '0.1.0',
			},
			{
				type: 'input',
				name: 'blockCategoryTitle',
				message: 'Título da categoria de blocos',
				default: (answers) => `${answers.title} Blocks`,
			},
			{
				type: 'input',
				name: 'blockCategorySlug',
				message: 'Slug da categoria de blocos',
				default: (answers) => `${answers.slug}-blocks`,
				filter: slugify,
			},
			{
				type: 'confirm',
				name: 'setupEnv',
				message: 'Gerar .env.example com host/port?',
				default: true,
			},
			{
				type: 'input',
				name: 'devHost',
				message: 'Host local do Vite',
				default: '127.0.0.1',
				when: (answers) => answers.setupEnv,
			},
			{
				type: 'input',
				name: 'devPort',
				message: 'Porta local do Vite',
				default: '5173',
				when: (answers) => answers.setupEnv,
			},
			{
				type: 'input',
				name: 'destination',
				message: 'Diretório de saída',
				default: (answers) => path.join('godev', answers.slug),
			},
			{
				type: 'confirm',
				name: 'runInstall',
				message: 'Executar pnpm install automaticamente no novo tema?',
				default: false,
			},
		],
		actions: [
			async (answers) => {
				const slug = slugify(answers.slug);
				const snake = snakeCase(slug);
				const constant = constantCase(slug);
				const pascal = pascalCase(slug);
				const title = titleCase(answers.title);
				const blockCategoryTitle = answers.blockCategoryTitle;
				const blockCategorySlug = slugify(answers.blockCategorySlug || `${slug}-blocks`);
				const namespace = snake;

				const destRelative = answers.destination || path.join('godev', slug);
				const destDir = path.resolve(projectRoot, destRelative);

				await ensureDirectory(path.dirname(destDir));
				try {
					await fs.access(destDir);
					throw new Error(`❌ Destino já existe: ${destDir}\n   Use outro nome ou remova o diretório existente.`);
				} catch (err) {
					if (err.code !== 'ENOENT') {
						throw err;
					}
					// ok, não existe, pode continuar
				}

				await copyDirectory(projectRoot, destDir);

				await fs.rm(path.join(destDir, 'docs'), { recursive: true, force: true });
				await fs.rm(path.join(destDir, 'production'), { recursive: true, force: true });
				await fs.rm(path.join(destDir, 'node_modules'), { recursive: true, force: true });
				await fs.rm(path.join(destDir, 'godev'), { recursive: true, force: true });
				await fs.rm(path.join(destDir, 'scaffold'), { recursive: true, force: true });
				await fs.rm(path.join(destDir, 'pnpm-lock.yaml'), { force: true });

				const replacements = [
					{ search: /trydo-wp-theme-bolierplate/g, replace: slug },
					{ search: /trydo_wp_theme_bolierplate/g, replace: namespace },
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

					let content = await fs.readFile(filePath, 'utf8');
					let modified = content;

					for (const { search, replace } of replacements) {
						modified = modified.replace(search, replace);
					}

					if (modified !== content) {
						await fs.writeFile(filePath, modified, 'utf8');
					}
				}

				const styleHeader = `/*
Theme Name: ${title}
Theme URI: ${answers.themeURI || ''}
Author: ${answers.authorName}
Author URI: ${answers.authorURI || ''}
Description: ${answers.description}
Version: ${answers.version}
Requires at least: 6.7
Tested up to: 6.7
Requires PHP: 8.1
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: ${slug}
*/
`;
				await fs.writeFile(path.join(destDir, 'src/style.css'), styleHeader, 'utf8');

				const readme = `# ${title}

${answers.description}

## 🚀 Início Rápido

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Scripts Principais

- \`pnpm dev\`: Inicia o servidor de desenvolvimento (Vite + HMR)
- \`pnpm lint\`: Executa os linters
- \`pnpm production\`: Gera build final + ZIP em \`production/\`

## Informações

- Slug: ${slug}
- Text Domain: ${slug}
- Categoria de blocos: ${blockCategoryTitle} (${blockCategorySlug})
- Prefixo PHP: ${namespace}

Documentação completa disponível no repositório original do boilerplate.`;
				await fs.writeFile(path.join(destDir, 'README.md'), readme, 'utf8');

				if (answers.setupEnv) {
					const envExample = `WP_VITE_HOST=${answers.devHost}\nWP_VITE_PORT=${answers.devPort}\n`;
					await fs.writeFile(path.join(destDir, '.env.example'), envExample, 'utf8');
				}

				const pkgPath = path.join(destDir, 'package.json');
				try {
					const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
					pkg.name = slug;
					pkg.version = answers.version;
					pkg.description = answers.description;
					await writeJson(pkgPath, pkg);
				} catch (error) {
					throw new Error(`Falha ao atualizar package.json: ${error.message}`);
				}

				const composerPath = path.join(destDir, 'composer.json');
				try {
					const composer = JSON.parse(await fs.readFile(composerPath, 'utf8'));
					composer.name = `${slug}/theme`;
					composer.description = answers.description;
					await writeJson(composerPath, composer);
				} catch (error) {
					throw new Error(`Falha ao atualizar composer.json: ${error.message}`);
				}

				const themeJsonPath = path.join(destDir, 'src/theme.json');
				try {
					const themeJson = JSON.parse(await fs.readFile(themeJsonPath, 'utf8'));
					themeJson.version = answers.version;
					await writeJson(themeJsonPath, themeJson);
				} catch (error) {
					throw new Error(`Falha ao atualizar src/theme.json: ${error.message}`);
				}

				await createDocs(destDir, {
					title,
					slug,
					namespace,
					blockCategoryTitle,
					blockCategorySlug,
				});

				if (answers.runInstall) {
					console.log('[scaffold] Executando pnpm install...');
					const result = spawnSync('pnpm', ['install'], {
						cwd: destDir,
						stdio: 'inherit',
					});
					if (result.status !== 0) {
						console.warn('[scaffold] pnpm install retornou erro, continue manualmente se necessário.');
					}
				}

				const nextSteps = [
					`\n✅ Tema "${slug}" criado com sucesso!\n`,
					`📁 Localização: ${destDir}\n`,
					`🚀 Próximos passos:`,
					`   cd ${destRelative}`,
					!answers.runInstall ? `   pnpm install` : null,
					`   pnpm dev\n`,
					`📝 Documentação: ${path.join(destRelative, 'docs/ARCHITECTURE.md')}`,
					`📦 Build produção: pnpm production\n`,
				].filter(Boolean).join('\n');

				return nextSteps;
			},
		],
	});
};
