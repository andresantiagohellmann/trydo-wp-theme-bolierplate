import '../styles/editor.css';
import.meta.glob('@/blocks/**/editor.css', { eager: true });

const VITE_STYLE_ATTRIBUTE = 'data-vite-dev-id';
const STYLE_MOUNT_ID = 'trydo-wp-theme-bolierplate-vite-style-sync';
const FRAME_SELECTORS = [
	'iframe[name="editor-canvas"]',
	'iframe.editor-canvas__iframe',
	'.edit-post-visual-editor iframe',
	'.editor-canvas iframe',
];

const sanitizeId = (value) =>
	`trydo-wp-theme-bolierplate-vite-style-${String(value).replace(/[^a-z0-9_-]/gi, '-')}`;

const findEditorIframes = () => {
	const iframes = FRAME_SELECTORS.flatMap((selector) =>
		Array.from(document.querySelectorAll(selector))
	);

	return iframes
		.filter((iframe) => iframe && iframe.contentDocument)
		.filter((iframe, index, arr) => arr.indexOf(iframe) === index);
};

const ensureMountPoint = (doc) => {
	if (doc.getElementById(STYLE_MOUNT_ID)) {
		return;
	}

	const meta = doc.createElement('meta');
	meta.id = STYLE_MOUNT_ID;
	doc.head?.appendChild(meta);
};

const syncStylesToIframe = (iframeDoc, styles) => {
	ensureMountPoint(iframeDoc);

	const targetHead = iframeDoc.head || iframeDoc.documentElement;
	const activeIds = new Set();

	for (const styleNode of styles) {
		const viteId = styleNode.getAttribute(VITE_STYLE_ATTRIBUTE);

		if (!viteId) {
			continue;
		}

		activeIds.add(viteId);

		const targetId = sanitizeId(viteId);
		let target = iframeDoc.getElementById(targetId);

		if (!target) {
			target = iframeDoc.createElement('style');
			target.id = targetId;
			target.setAttribute(VITE_STYLE_ATTRIBUTE, viteId);
			targetHead.appendChild(target);
		}

		if (target.textContent !== styleNode.textContent) {
			target.textContent = styleNode.textContent;
		}
	}

	const existing = Array.from(iframeDoc.querySelectorAll(`style[${VITE_STYLE_ATTRIBUTE}]`));

	for (const node of existing) {
		const viteId = node.getAttribute(VITE_STYLE_ATTRIBUTE);

		if (!viteId || activeIds.has(viteId)) {
			continue;
		}

		node.remove();
	}
};

const syncEditorStyles = () => {
	if (typeof document === 'undefined') {
		return;
	}

	const styles = Array.from(document.querySelectorAll(`style[${VITE_STYLE_ATTRIBUTE}]`));

	if (!styles.length) {
		return;
	}

	const iframes = findEditorIframes();

	if (!iframes.length) {
		return;
	}

	for (const iframe of iframes) {
		const doc = iframe.contentDocument;

		if (!doc) {
			continue;
		}

		syncStylesToIframe(doc, styles);
	}
};

const setupSync = () => {
	if (typeof window === 'undefined') {
		return;
	}

	const maybeSync = () => {
		try {
			syncEditorStyles();
		} catch (error) {
			console.error(
				'[trydo-wp-theme-bolierplate theme] Failed to sync editor styles from Vite.',
				error
			);
		}
	};

	maybeSync();

	const headObserver = new MutationObserver(() => {
		maybeSync();
	});

	headObserver.observe(document.head, {
		subtree: true,
		childList: true,
	});

	const bodyObserver = new MutationObserver(maybeSync);

	const observeBody = () => {
		if (!document.body) {
			return;
		}

		bodyObserver.observe(document.body, {
			subtree: true,
			childList: true,
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener(
			'DOMContentLoaded',
			() => {
				observeBody();
				maybeSync();
				registerIframeListeners();
			},
			{ once: true }
		);
	} else {
		observeBody();
	}

	window.addEventListener(
		'load',
		() => {
			maybeSync();
			registerIframeListeners();
		},
		{ once: true }
	);
	window.addEventListener('focus', maybeSync);

	const registerIframeListeners = () => {
		const iframes = findEditorIframes();

		for (const iframe of iframes) {
			iframe.addEventListener('load', maybeSync);
		}
	};

	registerIframeListeners();

	if (import.meta.hot) {
		import.meta.hot.on('vite:afterUpdate', maybeSync);
		import.meta.hot.on('vite:beforeFullReload', () => {
			headObserver.disconnect();
			bodyObserver.disconnect();
		});
	}
};

setupSync();
