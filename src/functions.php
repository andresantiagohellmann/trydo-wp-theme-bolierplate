<?php

/**
 * Theme bootstrap file responsible for integrating Vite.
 */

require_once __DIR__ . '/inc/constants.php';
require_once __DIR__ . '/inc/vite.php';
require_once __DIR__ . '/inc/assets.php';
require_once __DIR__ . '/inc/editor.php';
require_once __DIR__ . '/inc/blocks.php';
require_once __DIR__ . '/inc/analytics.php';
require_once __DIR__ . '/inc/smooth-scroll.php';
require_once __DIR__ . '/inc/svg-support.php';

// Load vendors bundle first with high priority (lower number = higher priority)
add_action('wp_enqueue_scripts', 'trydo_wp_theme_bolierplate_enqueue_vendors', 5);
add_action('enqueue_block_assets', 'trydo_wp_theme_bolierplate_enqueue_vendors', 5);
add_action('enqueue_block_editor_assets', 'trydo_wp_theme_bolierplate_enqueue_vendors', 5);

// Load theme assets on frontend
add_action('wp_enqueue_scripts', 'trydo_wp_theme_bolierplate_enqueue_theme_assets');

// Load theme assets in editor iframe (correct way for WordPress to add styles to iframe)
add_action('enqueue_block_assets', 'trydo_wp_theme_bolierplate_enqueue_theme_assets');

// Also load in editor context for dev mode HMR support
// Note: This causes a warning in production, but is necessary for dev mode
add_action('enqueue_block_editor_assets', 'trydo_wp_theme_bolierplate_enqueue_theme_assets');

// Load block editor specific assets (React components, editor-only scripts)
add_action('enqueue_block_editor_assets', 'trydo_wp_theme_bolierplate_enqueue_block_editor_assets');
add_action('init', 'trydo_wp_theme_bolierplate_register_blocks');
add_action('after_setup_theme', 'trydo_wp_theme_bolierplate_setup_theme_support');
add_action('init', 'trydo_wp_theme_bolierplate_setup_editor_styles');
add_filter('script_loader_tag', 'trydo_wp_theme_bolierplate_vite_force_module_type', 10, 3);
add_filter('block_categories_all', 'trydo_wp_theme_bolierplate_register_block_category', 10, 1);
add_filter('block_type_metadata', 'trydo_wp_theme_bolierplate_add_vendors_dependency_to_blocks');

// SVG Support - Secure uploads
add_filter('upload_mimes', 'trydo_wp_theme_allow_svg_upload');
add_filter('wp_handle_upload_prefilter', 'trydo_wp_theme_sanitize_svg_upload');
add_filter('wp_check_filetype_and_ext', 'trydo_wp_theme_fix_svg_mime_type', 10, 4);
add_filter('wp_prepare_attachment_for_js', 'trydo_wp_theme_svg_media_preview', 10, 3);
add_filter('admin_post_thumbnail_html', 'trydo_wp_theme_svg_thumbnail_display', 10, 2);
add_filter('wp_generate_attachment_metadata', 'trydo_wp_theme_svg_metadata', 10, 2);
