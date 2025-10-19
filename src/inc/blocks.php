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

		// Register the block
		$result = register_block_type_from_metadata($block_dir, $args);

		if (is_wp_error($result)) {
			error_log(
				sprintf(
					'[trydo-wp-theme-bolierplate theme] Failed to register block from %s: %s',
					$block_dir,
					$result->get_error_message(),
				),
			);
			continue;
		}

		// Add vendors as dependency to block scripts
		trydo_wp_theme_bolierplate_add_vendors_as_dependency($result);
	}
}

/**
 * Adds vendors bundle as a dependency to registered block scripts.
 *
 * @param WP_Block_Type $block_type The registered block type object.
 */
function trydo_wp_theme_bolierplate_add_vendors_as_dependency($block_type): void
{
	$vendors_handle = 'trydo-wp-theme-bolierplate-vendors';

	// Add vendors as dependency to editor_script
	if (!empty($block_type->editor_script)) {
		trydo_wp_theme_bolierplate_add_script_dependency(
			$block_type->editor_script,
			$vendors_handle,
		);
	}

	// Add vendors as dependency to script (runs in both editor and frontend)
	if (!empty($block_type->script)) {
		trydo_wp_theme_bolierplate_add_script_dependency($block_type->script, $vendors_handle);
	}

	// Add vendors as dependency to view_script (frontend only)
	if (!empty($block_type->view_script)) {
		trydo_wp_theme_bolierplate_add_script_dependency($block_type->view_script, $vendors_handle);
	}
}

/**
 * Adds a dependency to a registered script handle(s).
 *
 * @param string|array $handles Script handle or array of handles.
 * @param string $dependency Dependency handle to add.
 */
function trydo_wp_theme_bolierplate_add_script_dependency($handles, string $dependency): void
{
	if (!is_array($handles)) {
		$handles = [$handles];
	}

	foreach ($handles as $handle) {
		$script = wp_scripts()->query($handle, 'registered');

		if ($script && !in_array($dependency, $script->deps, true)) {
			$script->deps[] = $dependency;
		}
	}
}

/**
 * Ensures block scripts have vendors bundle as dependency (legacy filter-based approach).
 * This is kept for backwards compatibility but the new approach uses direct dependency injection.
 */
function trydo_wp_theme_bolierplate_add_vendors_dependency_to_blocks($metadata)
{
	// If block has a script (runs in both editor and front-end) or viewScript (front-end only),
	// ensure vendors bundle is loaded first by making it a dependency
	if (!empty($metadata['script']) || !empty($metadata['viewScript'])) {
		// Make sure vendors is enqueued first
		trydo_wp_theme_bolierplate_enqueue_vendors();
	}

	return $metadata;
}
