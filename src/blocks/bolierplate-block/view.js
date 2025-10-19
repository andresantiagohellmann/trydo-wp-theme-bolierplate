/**
 * Front-end only JavaScript for the Boilerplate Block.
 *
 * This script runs ONLY on the front-end (not in the editor).
 * Use this file for features that should NOT run in the editor:
 * - Analytics tracking
 * - Modal/popup triggers
 * - External API calls
 * - Navigation/redirects
 * - Any disruptive user interactions
 *
 * For features that work in both contexts, use interactive.js instead.
 */

const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-bolierplate-block';

/**
 * Initialize click actions (alerts, modals, tracking, etc).
 * ❌ Runs ONLY on front-end (not in editor).
 *
 * @param {HTMLElement} ctaButton - The button element
 */
function initClickActions(ctaButton) {
	ctaButton.addEventListener('click', () => {
		// Example: Alert (disruptive, shouldn't run in editor)
		alert('Clicou! (Este alert só aparece no front-end, não no editor)');

		// Example: Track analytics
		// if (window.gtag) {
		//   gtag('event', 'click', { event_category: 'CTA', event_label: 'Boilerplate Block' });
		// }

		// Example: Open modal
		// openModal('contact-form');

		// Example: External API call
		// fetch('/api/track-click', { method: 'POST', body: JSON.stringify({ block: 'boilerplate' }) });
	});
}

/**
 * Initialize front-end only features when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
	// Find all instances of this block on the page
	const blocks = document.querySelectorAll(`.${BLOCK_CLASS}`);

	blocks.forEach((block) => {
		const ctaButton = block.querySelector(`.${BLOCK_CLASS}__button`);

		if (ctaButton) {
			// ❌ FRONT-END ONLY: These features don't run in the editor
			initClickActions(ctaButton);
		}
	});
});
