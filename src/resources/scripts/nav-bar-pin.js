import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const SCROLL_THRESHOLD = 100;
const HIDE_DURATION = 0.3;

export function initNavBarPin() {
	if (import.meta.env.DEV && window.navBarPin?.cleanup) {
		window.navBarPin.cleanup();
	}

	if (
		document.body.classList.contains('wp-admin') ||
		document.body.classList.contains('block-editor-page')
	) {
		return;
	}

	if (!document.body.classList.contains('smooth-scroll-enabled')) {
		return;
	}

	const navHeader = document.querySelector('[data-nav-bar="wrapper"]');

	if (!navHeader) {
		console.warn('NavBarPin: wrapper not found');
		return;
	}

	const smoother = ScrollSmoother.get();

	gsap.set(navHeader, { zIndex: 80, willChange: 'opacity' });

	const fadeTween = gsap.to(navHeader, {
		autoAlpha: 0,
		duration: HIDE_DURATION,
		ease: 'power2.out',
		paused: true,
	});

	const pinTrigger = ScrollTrigger.create({
		trigger: navHeader,
		start: 'top top',
		end: 'max',
		pin: true,
		pinSpacing: false,
	});

	const tracker = ScrollTrigger.create({
		start: 0,
		end: 'max',
		onUpdate(self) {
			const currentScroll = smoother ? smoother.scrollTop() : self.scroll();

			if (currentScroll < SCROLL_THRESHOLD) {
				fadeTween.reverse();
				return;
			}

			if (self.direction === 1) {
				fadeTween.play();
			} else if (self.direction === -1) {
				fadeTween.reverse();
			}
		},
	});

	const handleRefresh = () => {
		const currentScroll = smoother ? smoother.scrollTop() : ScrollTrigger.scroll();
		if (currentScroll < SCROLL_THRESHOLD) {
			fadeTween.progress(0);
		}
	};

	ScrollTrigger.addEventListener('refresh', handleRefresh);

	const cleanup = () => {
		pinTrigger?.kill();
		tracker?.kill();
		fadeTween?.kill();
		ScrollTrigger.removeEventListener('refresh', handleRefresh);
		gsap.set(navHeader, { clearProps: 'opacity,visibility,willChange,transform' });
	};

	if (import.meta.env.DEV) {
		window.navBarPin = { cleanup };
	}

	return cleanup;
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initNavBarPin);
} else {
	initNavBarPin();
}
