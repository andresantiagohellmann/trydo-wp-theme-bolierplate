<?php
/**
 * ScrollSmoother integration for GSAP
 * Simple setup - HTML structure is defined in templates
 */

/**
 * Add smooth-scroll class to body on front-end only
 */
function trydo_wp_theme_bolierplate_add_smooth_scroll_body_class($classes)
{
	if (is_admin()) {
		return $classes;
	}

	$classes[] = 'smooth-scroll-enabled';

	return $classes;
}
add_filter('body_class', 'trydo_wp_theme_bolierplate_add_smooth_scroll_body_class');

/**
 * Prints the opening markup required by GSAP ScrollSmoother.
 * Hooks into wp_body_open so every front-end template is wrapped automatically.
 */
function trydo_wp_theme_bolierplate_scrollsmoother_open_wrapper(): void
{
	if (is_admin()) {
		return;
	}

	echo '<div id="smooth-wrapper"><div id="smooth-content">';
}
add_action('wp_body_open', 'trydo_wp_theme_bolierplate_scrollsmoother_open_wrapper', 5);

/**
 * Prints the closing markup for the ScrollSmoother wrapper.
 * Runs early on wp_footer to close the wrapper before scripts are output.
 */
function trydo_wp_theme_bolierplate_scrollsmoother_close_wrapper(): void
{
	if (is_admin()) {
		return;
	}

	echo '</div></div>';
}
add_action('wp_footer', 'trydo_wp_theme_bolierplate_scrollsmoother_close_wrapper', 5);
