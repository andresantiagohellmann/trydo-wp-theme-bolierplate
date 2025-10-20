#!/usr/bin/env node

/**
 * Custom formatter for HTML inside PHP files
 * Fixes common issues like mixed quotes, excess blank lines, and weird line breaks
 */

import fs from 'fs';
import { glob } from 'glob';
import prettier from 'prettier';

async function formatPhpHtml(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	let modified = false;

	// Split by PHP tags to separate PHP and HTML sections
	const parts = content.split(/(<\?php[\s\S]*?\?>|<\?=[\s\S]*?\?>)/);

	const formatted = await Promise.all(
		parts.map(async (part) => {
			// Skip PHP sections (odd indexes after split)
			if (part.startsWith('<?php') || part.startsWith('<?=')) {
				return part;
			}

			// Skip empty or whitespace-only parts
			if (!part.trim()) {
				return part;
			}

			// Format HTML sections
			let html = part;

			// If this looks like HTML (has tags), format it with Prettier
			if (/<[a-z]/i.test(html)) {
				try {
					const formatted = await prettier.format(html, {
						parser: 'html',
						useTabs: true,
						tabWidth: 4,
						printWidth: 100,
						htmlWhitespaceSensitivity: 'ignore',
						singleQuote: false,
					});
					html = formatted.trim() + '\n';
					modified = true;
				} catch {
					// If prettier fails, fall back to manual formatting
					console.warn(`Prettier failed for HTML section, using manual formatting`);
					html = manualFormatHtml(html);
				}
			} else {
				html = manualFormatHtml(html);
			}

			return html;
		})
	);

	const result = formatted.join('');

	if (modified || result !== content) {
		fs.writeFileSync(filePath, result, 'utf8');
		// eslint-disable-next-line no-console
		console.log(`✓ Formatted: ${filePath}`);
		return true;
	}

	return false;
}

function manualFormatHtml(html) {
	// Remove excess blank lines (more than 1 consecutive)
	html = html.replace(/\n\s*\n\s*\n+/g, '\n\n');

	// Normalize quotes in HTML attributes to double quotes
	html = html.replace(/(\s+\w+)='([^']*)'/g, '$1="$2"');

	// Fix weird line breaks in tags (like <i\n class="">)
	html = html.replace(/<(\w+)\s*\n\s+/g, '<$1 ');

	// Remove trailing spaces at end of lines
	html = html.replace(/[ \t]+$/gm, '');

	return html;
}

async function main() {
	const args = process.argv.slice(2);
	const pattern = args[0] || 'src/**/*.php';

	// eslint-disable-next-line no-console
	console.log(`Formatting PHP files matching: ${pattern}\n`);

	const files = await glob(pattern, {
		ignore: ['vendor/**', 'node_modules/**', 'dist/**'],
	});

	let formatted = 0;
	for (const file of files) {
		if (await formatPhpHtml(file)) {
			formatted++;
		}
	}

	// eslint-disable-next-line no-console
	console.log(`\n${formatted} file(s) formatted`);
}

main().catch(console.error);
