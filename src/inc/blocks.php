<?php

/**
 * Registers a custom block category for theme blocks.
 */
function trydo_wp_theme_bolierplate_register_block_category($categories)
{
	// Add custom category at the beginning of the array
	return array_merge(
		[
			[
				'slug' => 'trydo-blocks',
				'title' => __('Trydo Blocks', 'trydo-wp-theme-bolierplate'),
				'icon' => 'admin-customizer',
			],
		],
		$categories,
	);
}

/**
 * Registers all custom blocks located under src/blocks.
 */
function trydo_wp_theme_bolierplate_register_blocks(): void
{
	$blocks_dir = trydo_wp_theme_bolierplate_theme_src_path() . '/blocks';

	if (!is_dir($blocks_dir)) {
		return;
	}

	$block_json_files = glob($blocks_dir . '/*/block.json');

	if (!$block_json_files) {
		return;
	}

	foreach ($block_json_files as $block_json) {
		$block_dir = dirname($block_json);
		$render_path = $block_dir . '/render.php';

		$args = [];

		if (file_exists($render_path)) {
			$args['render_callback'] = static function (
				array $attributes,
				string $content,
				\WP_Block $block,
			) use ($render_path) {
				// Ensure vendors bundle is enqueued before rendering block
				trydo_wp_theme_bolierplate_enqueue_vendors();

				return require $render_path;
			};
		}

		$result = register_block_type_from_metadata($block_dir, $args);

		if (is_wp_error($result)) {
			error_log(
				sprintf(
					'[trydo-wp-theme-bolierplate theme] Failed to register block from %s: %s',
					$block_dir,
					$result->get_error_message(),
				),
			);
		}
	}
}

/**
 * Ensures block view scripts have vendors bundle as dependency.
 */
function trydo_wp_theme_bolierplate_add_vendors_dependency_to_blocks($metadata)
{
	// If block has a viewScript, ensure vendors is loaded first
	if (!empty($metadata['viewScript'])) {
		add_action('wp_enqueue_scripts', 'trydo_wp_theme_bolierplate_enqueue_vendors', 5);
	}

	return $metadata;
}
