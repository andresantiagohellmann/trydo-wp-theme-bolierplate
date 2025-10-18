<?php
/**
 * Theme bootstrap file responsible for integrating Vite.
 */

require_once __DIR__ . '/inc/constants.php';
require_once __DIR__ . '/inc/vite.php';
require_once __DIR__ . '/inc/assets.php';
require_once __DIR__ . '/inc/editor.php';
require_once __DIR__ . '/inc/blocks.php';

add_action('wp_enqueue_scripts', 'trydo_wp_theme_bolierplate_enqueue_theme_assets');
add_action('enqueue_block_assets', 'trydo_wp_theme_bolierplate_enqueue_theme_assets');
add_action('enqueue_block_editor_assets', 'trydo_wp_theme_bolierplate_enqueue_theme_assets');
add_action('enqueue_block_editor_assets', 'trydo_wp_theme_bolierplate_enqueue_block_editor_assets');
add_action('init', 'trydo_wp_theme_bolierplate_register_blocks');
add_action('after_setup_theme', 'trydo_wp_theme_bolierplate_setup_theme_support');
add_action('init', 'trydo_wp_theme_bolierplate_setup_editor_styles');
add_filter('script_loader_tag', 'trydo_wp_theme_bolierplate_vite_force_module_type', 10, 3);
add_filter('block_categories_all', 'trydo_wp_theme_bolierplate_register_block_category', 10, 1);

