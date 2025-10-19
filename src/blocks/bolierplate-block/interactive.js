/**
 * Interactive JavaScript for the Boilerplate Block.
 *
 * This script runs in BOTH the editor and front-end.
 * Use this file for features that should work in both contexts (animations, hovers, etc.).
 *
 * For front-end only features (analytics, modals), use view.js instead.
 *
 * Uses GSAP from the vendors bundle for animations.
 */

const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-bolierplate-block';

/**
 * Initialize entrance animations.
 * ✅ Runs in BOTH editor and front-end (so you can preview animations).
 *
 * @param {HTMLElement} block - The block element
 * @param {object} gsap - GSAP instance
 */
function initEntranceAnimations(block, gsap) {
	const title = block.querySelector(`.${BLOCK_CLASS}__title`);
	const description = block.querySelector(`.${BLOCK_CLASS}__description`);
	const ctaButton = block.querySelector(`.${BLOCK_CLASS}__button`);

	// Subtle entrance animation for the block
	gsap.fromTo(
		block,
		{ opacity: 0, y: 16 },
		{
			opacity: 1,
			y: 0,
			duration: 0.6,
			ease: 'power1.out',
			clearProps: 'opacity,transform',
		}
	);

	// Stagger animation for content elements
	const contentElements = [title, description, ctaButton].filter(Boolean);

	if (contentElements.length > 0) {
		gsap.fromTo(
			contentElements,
			{ opacity: 0, y: 12 },
			{
				opacity: 1,
				y: 0,
				duration: 0.4,
				delay: 0.1,
				stagger: 0.12,
				ease: 'power1.out',
				clearProps: 'opacity,transform',
			}
		);
	}
}

/**
 * Initialize button hover interactions.
 * ✅ Runs in BOTH editor and front-end.
 *
 * @param {HTMLElement} ctaButton - The button element
 * @param {object} gsap - GSAP instance
 */
function initButtonHover(ctaButton, gsap) {
	ctaButton.addEventListener('mouseenter', () => {
		gsap.to(ctaButton, {
			scale: 1.04,
			duration: 0.2,
			ease: 'power1.out',
		});
	});

	ctaButton.addEventListener('mouseleave', () => {
		gsap.to(ctaButton, {
			scale: 1,
			duration: 0.2,
			ease: 'power1.out',
		});
	});
}

/**
 * Initialize block interactivity when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
	// Access GSAP from the vendors bundle
	const { gsap } = window.ThemeVendors || {};

	if (!gsap) {
		console.warn('GSAP not available. Vendors bundle may not be loaded.');
		return;
	}

	// Find all instances of this block on the page
	const blocks = document.querySelectorAll(`.${BLOCK_CLASS}`);

	blocks.forEach((block) => {
		const ctaButton = block.querySelector(`.${BLOCK_CLASS}__button`);

		// ✅ ALWAYS RUN: Animations work in both editor and front-end
		// This allows you to preview animations while editing!
		initEntranceAnimations(block, gsap);

		if (ctaButton) {
			// ✅ ALWAYS RUN: Hover effects work in both contexts
			// This provides immediate visual feedback while editing
			initButtonHover(ctaButton, gsap);
		}
	});
});
