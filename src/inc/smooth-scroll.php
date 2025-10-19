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
	// Only add on front-end (not in admin or editor)
	if (!is_admin()) {
		$classes[] = 'smooth-scroll-enabled';
	}
	return $classes;
}
add_filter('body_class', 'trydo_wp_theme_bolierplate_add_smooth_scroll_body_class');
