<?php

/**
 * Ensures the Vite-powered assets are loaded only once per request.
 */
function trydo_wp_theme_bolierplate_enqueue_theme_assets(): void
{
	static $enqueued = false;

	if ($enqueued) {
		return;
	}

	$enqueued = true;

	// Enqueue vendors bundle first (contains GSAP, etc.)
	trydo_wp_theme_bolierplate_enqueue_vendors();

	// Then enqueue theme assets
	trydo_wp_theme_bolierplate_vite_enqueue_entry(
		TRYDO_WP_THEME_BOLIERPLATE_VITE_THEME_ENTRY,
		'trydo-wp-theme-bolierplate-theme',
	);
}

/**
 * Enqueues the vendors bundle (external libraries like GSAP).
 * This is loaded separately to prevent duplication across blocks.
 */
function trydo_wp_theme_bolierplate_enqueue_vendors(): void
{
	static $enqueued = false;

	if ($enqueued) {
		return;
	}

	$enqueued = true;

	trydo_wp_theme_bolierplate_vite_enqueue_entry(
		TRYDO_WP_THEME_BOLIERPLATE_VITE_VENDORS_ENTRY,
		'trydo-wp-theme-bolierplate-vendors',
	);
}

/**
 * Loads the Vite block editor bundle ensuring Tailwind styles are present in the editor.
 * Note: Vendors bundle is now loaded via hooks with priority 5 in functions.php
 */
function trydo_wp_theme_bolierplate_enqueue_block_editor_assets(): void
{
	static $enqueued = false;

	if ($enqueued) {
		return;
	}

	$enqueued = true;

	$dependencies = ['wp-blocks', 'wp-element', 'wp-i18n', 'wp-block-editor', 'wp-components'];

	$origin = trydo_wp_theme_bolierplate_vite_enqueue_entry(
		TRYDO_WP_THEME_BOLIERPLATE_VITE_BLOCK_EDITOR_ENTRY,
		'trydo-wp-theme-bolierplate-blocks-editor',
		$dependencies,
	);

	if ($origin) {
		trydo_wp_theme_bolierplate_vite_enqueue_entry(
			TRYDO_WP_THEME_BOLIERPLATE_VITE_EDITOR_ENTRY,
			'trydo-wp-theme-bolierplate-editor-entry',
			[],
			$origin,
		);
	}
}

/**
 * Enqueues a Vite entry point and its dependencies.
 */
function trydo_wp_theme_bolierplate_vite_enqueue_entry(
	string $entry,
	string $handle,
	array $deps = [],
	?string $origin = null,
): ?string {
	$origin = $origin ?? trydo_wp_theme_bolierplate_vite_dev_server_origin();

	if ($origin) {
		trydo_wp_theme_bolierplate_vite_enqueue_dev_entry($origin, $entry, $handle, $deps);
		return $origin;
	}

	$manifest = trydo_wp_theme_bolierplate_vite_manifest();

	if (!$manifest) {
		error_log(
			sprintf(
				'[trydo-wp-theme-bolierplate theme] Manifest not found while trying to enqueue "%s". Run "pnpm build".',
				$entry,
			),
		);
		return null;
	}

	trydo_wp_theme_bolierplate_vite_enqueue_from_manifest($entry, $manifest, $handle, $deps);

	return null;
}

/**
 * Enqueues a dev server entry, ensuring the Vite client is only loaded once.
 */
function trydo_wp_theme_bolierplate_vite_enqueue_dev_entry(
	string $origin,
	string $entry,
	string $handle,
	array $deps = [],
): void {
	trydo_wp_theme_bolierplate_vite_enqueue_client($origin);

	wp_enqueue_script($handle, "{$origin}/{$entry}", $deps, null, true);
	trydo_wp_theme_bolierplate_vite_mark_module_script($handle);
}

/**
 * Enqueues the Vite HMR client when the dev server is active.
 */
function trydo_wp_theme_bolierplate_vite_enqueue_client(string $origin): void
{
	static $client_enqueued = false;

	if ($client_enqueued) {
		return;
	}

	$client_handle = 'trydo-wp-theme-bolierplate-vite-client';

	wp_enqueue_script($client_handle, "{$origin}/@vite/client", [], null, true);
	trydo_wp_theme_bolierplate_vite_mark_module_script($client_handle);

	$client_enqueued = true;
}

/**
 * Recursively enqueue scripts and styles defined in the Vite manifest.
 *
 * @param array<string,mixed> $manifest
 */
function trydo_wp_theme_bolierplate_vite_enqueue_from_manifest(
	string $entry,
	array $manifest,
	?string $script_handle = null,
	array $deps = [],
): void {
	static $scripts = [];
	static $styles = [];

	if (!isset($manifest[$entry])) {
		return;
	}

	$item = $manifest[$entry];

	foreach ($item['imports'] ?? [] as $import) {
		trydo_wp_theme_bolierplate_vite_enqueue_from_manifest($import, $manifest);
	}

	foreach ($item['css'] ?? [] as $css) {
		if (isset($styles[$css])) {
			continue;
		}

		$handle = 'trydo-wp-theme-bolierplate-style-' . md5($css);

		// Use wp_enqueue_style which works for both frontend and editor contexts
		// WordPress will automatically handle adding it to the editor iframe
		wp_enqueue_style($handle, trydo_wp_theme_bolierplate_vite_dist_url($css), [], null);

		$styles[$css] = true;
	}

	if (empty($item['file']) || isset($scripts[$item['file']])) {
		return;
	}

	$handle = $script_handle ?? 'trydo_wp_theme_bolierplate-script-' . md5($item['file']);

	$script_deps = $script_handle ? $deps : [];

	wp_enqueue_script(
		$handle,
		trydo_wp_theme_bolierplate_vite_dist_url($item['file']),
		$script_deps,
		null,
		true,
	);
	trydo_wp_theme_bolierplate_vite_mark_module_script($handle);

	$scripts[$item['file']] = true;
}

/**
 * Ensures the provided script handle is printed with type="module".
 */
function trydo_wp_theme_bolierplate_vite_mark_module_script(string $handle): void
{
	wp_script_add_data($handle, 'type', 'module');

	if (!isset($GLOBALS['trydo_wp_theme_bolierplate_vite_module_handles'])) {
		$GLOBALS['trydo_wp_theme_bolierplate_vite_module_handles'] = [];
	}

	$GLOBALS['trydo_wp_theme_bolierplate_vite_module_handles'][$handle] = true;
}

/**
 * Filters script tags to ensure module type is honoured by browsers.
 */
function trydo_wp_theme_bolierplate_vite_force_module_type(
	string $tag,
	string $handle,
	string $src,
): string {
	if (empty($GLOBALS['trydo_wp_theme_bolierplate_vite_module_handles'][$handle])) {
		return $tag;
	}

	if (false !== strpos($tag, 'type=')) {
		$tag = preg_replace('/\s+type=([\'"]).*?\1/', '', $tag);
	}

	return str_replace('<script', '<script type="module"', $tag);
}
