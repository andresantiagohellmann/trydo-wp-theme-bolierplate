/**
 * Front-end JavaScript for the Boilerplate Block.
 *
 * This script handles interactivity on the front-end (not in the editor).
 * It runs only on pages that contain this block.
 */

const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-bolierplate-block';

/**
 * Initialize block interactivity when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
	// Find all instances of this block on the page
	const blocks = document.querySelectorAll(`.${BLOCK_CLASS}`);

	blocks.forEach((block) => {
		// Find the CTA button within this block
		const ctaButton = block.querySelector(`.${BLOCK_CLASS}__button`);

		if (!ctaButton) {
			return;
		}

		// Add click event listener
		ctaButton.addEventListener('click', () => {
			// Prevent default link behavior if needed
			// event.preventDefault();

			// Show alert
			alert('Trydo Blocks CTA');

			// You can add more sophisticated behavior here:
			// - Open a modal
			// - Track analytics
			// - Load content dynamically
			// - Navigate to the link URL
		});
	});
});
