/**
 * Vendors Bundle
 *
 * Centralized import for external libraries used across the theme and blocks.
 * This prevents code duplication and ensures libraries are loaded only once.
 *
 * Usage in blocks:
 * const { gsap, ScrollTrigger } = window.ThemeVendors;
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Configure GSAP defaults
gsap.defaults({
	ease: 'power2.out',
	duration: 0.6,
});

// Expose vendors globally for blocks to access
window.ThemeVendors = {
	gsap,
	ScrollTrigger,
};

// Also export for ESM imports
export { gsap, ScrollTrigger };
