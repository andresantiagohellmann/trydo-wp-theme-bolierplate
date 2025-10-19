import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * Initialize ScrollSmoother for smooth scrolling experience
 * Only runs on front-end (not in admin or editor)
 */
export function initScrollSmoother() {
	// Check if we're in the admin or editor
	if (
		document.body.classList.contains('wp-admin') ||
		document.body.classList.contains('block-editor-page')
	) {
		return;
	}

	// Check if smooth scroll is enabled
	if (!document.body.classList.contains('smooth-scroll-enabled')) {
		return;
	}

	// Wait for DOM to be ready
	const wrapper = document.querySelector('#smooth-wrapper');
	const content = document.querySelector('#smooth-content');

	if (!wrapper || !content) {
		console.warn(
			'ScrollSmoother: Required elements #smooth-wrapper or #smooth-content not found'
		);
		return;
	}

	// Create ScrollSmoother instance
	const smoother = ScrollSmoother.create({
		wrapper: '#smooth-wrapper',
		content: '#smooth-content',
		smooth: 1.5, // Smoothness level (0-3, higher = smoother)
		effects: true, // Enable data-speed and data-lag effects
		smoothTouch: 0.1, // Light smooth scroll on touch devices (0 = disabled)
		normalizeScroll: true, // Prevent address bar from showing/hiding on mobile
		ignoreMobileResize: true, // Ignore mobile resize events
	});

	// Optional: Add parallax effects to elements
	// Elements with data-speed attribute will move at different speeds
	// Example: <div data-speed="0.5">This moves slower</div>
	// Example: <div data-speed="1.5">This moves faster</div>

	// Expose smoother instance globally for debugging
	if (import.meta.env.DEV) {
		window.smoother = smoother;
		console.log('ScrollSmoother initialized:', smoother);
	}

	return smoother;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initScrollSmoother);
} else {
	initScrollSmoother();
}
