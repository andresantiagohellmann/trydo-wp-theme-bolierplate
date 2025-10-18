<?php

/**
 * Registers all custom blocks located under src/blocks.
 */
function trydo_wp_theme_bolierplate_register_blocks(): void
{
    $blocks_dir = trydo_wp_theme_bolierplate_theme_src_path() . '/blocks';

    if (! is_dir($blocks_dir)) {
        return;
    }

    $block_json_files = glob($blocks_dir . '/*/block.json');

    if (! $block_json_files) {
        return;
    }

    foreach ($block_json_files as $block_json) {
        $block_dir = dirname($block_json);
        $render_path = $block_dir . '/render.php';

        $args = [];

        if (file_exists($render_path)) {
            $args['render_callback'] = static function (array $attributes, string $content, \WP_Block $block) use ($render_path) {
                return require $render_path;
            };
        }

        $result = register_block_type_from_metadata($block_dir, $args);

        if (is_wp_error($result)) {
            error_log(sprintf('[trydo-wp-theme-bolierplate theme] Failed to register block from %s: %s', $block_dir, $result->get_error_message()));
        }
    }
}
