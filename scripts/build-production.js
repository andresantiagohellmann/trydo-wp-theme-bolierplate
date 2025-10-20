#!/usr/bin/env node

/**
 * Build & package the theme for production.
 *
 * Steps:
 * 1. Run `pnpm build` to generate the Vite assets into /dist
 * 2. Collect the files required for distribution (src, dist, vendor, composer files)
 * 3. Create production/<theme-slug>.zip ready to upload to a WordPress install
 */

import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const themeSlug = 'trydo-wp-theme-bolierplate';
const productionRoot = path.join(projectRoot, 'production');
const themeOutputDir = path.join(productionRoot, themeSlug);
const zipName = `${themeSlug}.zip`;
const zipPath = path.join(productionRoot, zipName);

const log = (message) => {
	console.log(`[production] ${message}`);
};

const run = (command) => {
	log(`$ ${command}`);
	execSync(command, { stdio: 'inherit', cwd: projectRoot });
};

const copyIfExists = async (source, destination) => {
	try {
		await fs.access(source);
	} catch {
		return;
	}

	await fs.cp(source, destination, {
		recursive: true,
		force: true,
	});
};

const copyFileIfExists = async (source, destination) => {
	try {
		await fs.access(source);
	} catch {
		return;
	}

	await fs.copyFile(source, destination);
};

async function main() {
	log('Building Vite assets...');
	run('pnpm build');

	log('Preparing production directory...');
	await fs.rm(productionRoot, { recursive: true, force: true });
	await fs.mkdir(themeOutputDir, { recursive: true });

	const themeSrcRoot = path.join(projectRoot, 'src');
	const themeDirectories = ['blocks', 'inc', 'parts', 'resources', 'templates'];
	const themeFiles = [
		'functions.php',
		'style.css',
		'theme.json',
		'screenshot.png',
		'templates/index.html',
	];

	log('Copying theme directories...');
	for (const dir of themeDirectories) {
		await copyIfExists(path.join(themeSrcRoot, dir), path.join(themeOutputDir, dir));
	}

	log('Copying theme files...');
	for (const file of themeFiles) {
		await copyFileIfExists(path.join(themeSrcRoot, file), path.join(themeOutputDir, file));
	}

	log('Copying dist assets...');
	await copyIfExists(path.join(projectRoot, 'dist'), path.join(themeOutputDir, 'dist'));

	log('Copying production root files...');
	await copyFileIfExists(
		path.join(projectRoot, 'README.md'),
		path.join(themeOutputDir, 'README.md')
	);

	if (process.platform === 'win32') {
		throw new Error('Zip packaging is not implemented for Windows in this script.');
	}

	log('Creating zip archive...');
	await fs.rm(zipPath, { force: true });
	run(`cd production && zip -rq ${zipName} ${themeSlug}`);

	log(`Production bundle ready: ${path.relative(projectRoot, zipPath)}`);
	log('You can upload this ZIP directly to your WordPress installation.');
}

main().catch((error) => {
	console.error('[production] Failed to build production package.');
	console.error(error);
	process.exitCode = 1;
});
