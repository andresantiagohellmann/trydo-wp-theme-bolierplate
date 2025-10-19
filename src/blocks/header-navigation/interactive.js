(function () {
	'use strict';

	const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-header-navigation';

	function toggleMenu(collapsible, toggleButton, forceState) {
		const isOpen = collapsible.dataset.state === 'open';
		const shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;

		collapsible.dataset.state = shouldOpen ? 'open' : 'closed';
		toggleButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
	}

	function initBlock(block) {
		if (block.dataset.trydoHeaderNavigationInitialized === 'true') {
			return;
		}

		const toggleButton = block.querySelector(`.${BLOCK_CLASS}__toggle`);
		const collapsible = block.querySelector(`.${BLOCK_CLASS}__collapsible`);

		if (!toggleButton || !collapsible) {
			return;
		}

		toggleButton.addEventListener('click', () => {
			toggleMenu(collapsible, toggleButton);
		});

		block.dataset.trydoHeaderNavigationInitialized = 'true';
	}

	function scan(root = document) {
		const blocks = root.querySelectorAll(`.${BLOCK_CLASS}`);
		blocks.forEach((block) => initBlock(block));
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => scan(document));
	} else {
		scan(document);
	}

	if (window.wp?.domReady) {
		window.wp.domReady(() => {
			scan(document);

			if ('MutationObserver' in window) {
				const observer = new MutationObserver((mutations) => {
					mutations.forEach((mutation) => {
						mutation.addedNodes.forEach((node) => {
							if (!(node instanceof Element)) {
								return;
							}

							if (node.matches?.(`.${BLOCK_CLASS}`)) {
								initBlock(node);
								return;
							}

							if (node.querySelectorAll) {
								scan(node);
							}
						});
					});
				});

				observer.observe(document.body, {
					childList: true,
					subtree: true,
				});
			}
		});
	}
})();
