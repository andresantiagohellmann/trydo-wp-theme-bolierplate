import js from '@eslint/js';
import globals from 'globals';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';

export default [
	{
		ignores: ['dist/**', 'node_modules/**', '.pnpm-store/**'],
	},
	js.configs.recommended,
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				// WordPress globals
				wp: 'readonly',
				jQuery: 'readonly',
				$: 'readonly',
			},
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			react: (await import('eslint-plugin-react')).default,
		},
		rules: {
			...reactRecommended.rules,
			...reactJsxRuntime.rules,
			// React settings
			'react/prop-types': 'off', // WordPress blocks don't use PropTypes
			'react/react-in-jsx-scope': 'off', // Not needed with JSX runtime

			// Best practices
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'prefer-const': 'error',
			'no-var': 'error',

			// Code style
			curly: ['error', 'all'],
			eqeqeq: ['error', 'always'],
			'no-else-return': 'error',
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];
