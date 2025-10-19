<?php

/**
 * Declares theme supports required for proper editor integration.
 */
function trydo_wp_theme_bolierplate_setup_theme_support(): void
{
	add_theme_support('editor-styles');

	add_theme_support('custom-logo', [
		'height' => 64,
		'width' => 240,
		'flex-height' => true,
		'flex-width' => true,
		'unlink-homepage-logo' => true,
	]);
}

/**
 * Resolves the list of CSS URLs that must be loaded inside the block editor.
 *
 * @return string[]
 */
function trydo_wp_theme_bolierplate_vite_resolve_editor_style_urls(): array
{
	$manifest = trydo_wp_theme_bolierplate_vite_manifest();

	if (!$manifest) {
		return [];
	}

	$entries = [
		'src/resources/scripts/main.js',
		'src/blocks/index.js',
		'src/resources/scripts/editor.js',
	];

	$styles = [];

	foreach ($entries as $entry) {
		if (empty($manifest[$entry]['css'])) {
			continue;
		}

		foreach ($manifest[$entry]['css'] as $css) {
			$styles[] = trydo_wp_theme_bolierplate_vite_dist_url($css);
		}

		if (
			!empty($manifest[$entry]['file']) &&
			trydo_wp_theme_bolierplate_vite_asset_is_css((string) $manifest[$entry]['file'])
		) {
			$styles[] = trydo_wp_theme_bolierplate_vite_dist_url($manifest[$entry]['file']);
		}
	}

	return array_values(array_unique($styles));
}

/**
 * Registers a filter to append editor styles dynamically on each request.
 */
function trydo_wp_theme_bolierplate_setup_editor_styles(): void
{
	if (trydo_wp_theme_bolierplate_vite_dev_server_origin()) {
		return;
	}

	$styles = trydo_wp_theme_bolierplate_vite_resolve_editor_style_urls();

	if (!$styles) {
		return;
	}

	foreach ($styles as $style) {
		add_editor_style($style);
	}
}
