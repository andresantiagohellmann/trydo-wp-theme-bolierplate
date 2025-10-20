(function () {
	'use strict';

	/**
	 * Handle menu toggle animation
	 * @param {object} gsap - GSAP instance
	 * @param {HTMLElement} navButton - The button element
	 * @param {HTMLElement} navContainer - The container element
	 * @param {HTMLElement} navContent - The content element
	 */
	const handleMenuToggle = (gsap, navButton, navContainer, navContent) => {
		const svgRects = navButton.querySelectorAll('rect');
		const topRect = svgRects[0];
		const bottomRect = svgRects[1];
		const BREAKPOINT = 1170;

		// Set initial state based on window size
		const isDesktop = window.innerWidth >= BREAKPOINT;

		if (isDesktop) {
			// Desktop: menu always open
			gsap.set(navContent, { opacity: 1 });
			gsap.set(navContainer, {
				scale: 1,
				borderRadius: '16px',
				opacity: 1,
				transformOrigin: 'top right',
			});
		} else {
			// Mobile: menu closed
			gsap.set(navContent, { opacity: 0 });
			gsap.set(navContainer, {
				scale: 0.1,
				borderRadius: '120px',
				opacity: 0,
				transformOrigin: 'top right',
			});
		}

		const tl = gsap.timeline({ paused: true, reversed: true });

		// Animate SVG lines to X shape
		tl.to(topRect, {
			duration: 0.3,
			attr: { y: 3 },
			rotation: 45,
			transformOrigin: 'center',
			ease: 'power2.inOut',
		});

		tl.to(
			bottomRect,
			{
				duration: 0.3,
				attr: { y: 3 },
				rotation: -45,
				transformOrigin: 'center',
				ease: 'power2.inOut',
			},
			'<'
		);

		tl.to(
			navContainer,
			{
				duration: 0.5,
				scale: 1,
				borderRadius: '16px',
				opacity: 1,
				transformOrigin: 'top right',
				ease: 'power2.out',
			},
			'-=0.1'
		);

		tl.to(
			navContent,
			{
				duration: 0.5,
				opacity: 1,
				ease: 'power2.out',
			},
			'-=0.3'
		);

		// Handle button click
		navButton.addEventListener('click', () => {
			// Only allow toggle on mobile
			if (window.innerWidth < BREAKPOINT) {
				tl.reversed() ? tl.play() : tl.reverse();
			}
		});

		// Handle window resize
		let wasDesktop = isDesktop;
		window.addEventListener('resize', () => {
			const isNowDesktop = window.innerWidth >= BREAKPOINT;

			if (isNowDesktop && !wasDesktop) {
				// Changed from mobile to desktop: open menu
				gsap.to(navContent, { opacity: 1, duration: 0.3 });
				gsap.to(navContainer, {
					scale: 1,
					borderRadius: '16px',
					opacity: 1,
					duration: 0.3,
				});
				// Reset icon to hamburger (lines)
				gsap.to(topRect, {
					duration: 0.3,
					attr: { y: 0 },
					rotation: 0,
					transformOrigin: 'center',
				});
				gsap.to(bottomRect, {
					duration: 0.3,
					attr: { y: 6 },
					rotation: 0,
					transformOrigin: 'center',
				});
				tl.pause().reversed(true);
			} else if (!isNowDesktop && wasDesktop) {
				// Changed from desktop to mobile: close menu
				gsap.to(navContent, { opacity: 0, duration: 0.3 });
				gsap.to(navContainer, {
					scale: 0.1,
					borderRadius: '120px',
					opacity: 0,
					duration: 0.3,
				});
				// Reset icon to hamburger (lines)
				gsap.to(topRect, {
					duration: 0.3,
					attr: { y: 0 },
					rotation: 0,
					transformOrigin: 'center',
				});
				gsap.to(bottomRect, {
					duration: 0.3,
					attr: { y: 6 },
					rotation: 0,
					transformOrigin: 'center',
				});
				tl.pause().reversed(true);
			}

			wasDesktop = isNowDesktop;
		});
	};

	/**
	 * Initialize interactive block
	 */
	const initInteractiveBlock = () => {
		const { gsap } = window.ThemeVendors || {};

		if (!gsap) {
			console.warn('GSAP is not loaded. Interactive block will not function properly.');
			return;
		}

		const navBar = document.querySelector('[data-nav-bar="wrapper"]');
		const navButton = navBar.querySelector('[data-nav-bar="nav-button"]');
		const navContainer = navBar.querySelector('[data-nav-bar="nav-container"]');

		const navContent = navBar.querySelector('[data-nav-bar="nav-content"]');

		handleMenuToggle(gsap, navButton, navContainer, navContent);
	};

	// Initialize on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initInteractiveBlock);
	} else {
		initInteractiveBlock();
	}

	// Also initialize when WordPress is ready (for editor)
	if (window.wp?.domReady) {
		window.wp.domReady(initInteractiveBlock);
	}
})();
