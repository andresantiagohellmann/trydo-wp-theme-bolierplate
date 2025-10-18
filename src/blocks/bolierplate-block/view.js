/**
 * Front-end JavaScript for the Boilerplate Block.
 *
 * This script handles interactivity on the front-end (not in the editor).
 * It runs only on pages that contain this block.
 *
 * Uses GSAP from the vendors bundle for animations.
 */

const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-bolierplate-block';

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
		const title = block.querySelector(`.${BLOCK_CLASS}__title`);
		const description = block.querySelector(`.${BLOCK_CLASS}__description`);
		const ctaButton = block.querySelector(`.${BLOCK_CLASS}__button`);

		// Subtle entrance animation for the block and its content.
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

		// Gentle hover feedback on the CTA button.
		if (ctaButton) {
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
	});
});
