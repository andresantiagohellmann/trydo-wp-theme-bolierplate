import '../styles/editor.css';
import.meta.glob('@/blocks/**/editor.css', { eager: true });

// Ensure icon fonts are available inside the editor iframe
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/light';
import '@phosphor-icons/web/thin';
import '@phosphor-icons/web/fill';
import '@phosphor-icons/web/duotone';

const VITE_STYLE_ATTRIBUTE = 'data-vite-dev-id';
const SYNC_MARKER_ATTRIBUTE = 'data-trydo-style-sync';
const STYLE_PRIORITY_ATTRIBUTE = 'data-trydo-priority';
const STYLE_MOUNT_ID = 'trydo-wp-theme-bolierplate-vite-style-sync';
const FRAME_SELECTORS = [
	'iframe[name="editor-canvas"]',
	'iframe.editor-canvas__iframe',
	'.edit-post-visual-editor iframe',
	'.editor-canvas iframe',
];
const DEV_CLIENT_SELECTOR = 'script[src*="@vite/client"]';

const observedIframes = new WeakSet();
const iframeWatchers = new Map();

const sanitizeId = (value) =>
	`trydo-wp-theme-bolierplate-vite-style-${String(value)
		.replace(/[^a-z0-9_-]/gi, '-')
		.replace(/-+/g, '-')}`;

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

const resolveDevServerOrigin = () => {
	const viteClient = document.querySelector(DEV_CLIENT_SELECTOR);

	if (!viteClient || !viteClient.src) {
		return null;
	}

	try {
		return new URL(viteClient.src).origin;
	} catch (error) {
		console.warn(
			'[trydo-wp-theme-bolierplate] Failed to resolve Vite dev server origin.',
			error
		);
		return null;
	}
};

const DEV_SERVER_ORIGIN = resolveDevServerOrigin();

const isViteStylesheetHref = (href) => {
	if (!href) {
		return false;
	}

	try {
		const url = new URL(href, window.location.origin);

		if (DEV_SERVER_ORIGIN && href.startsWith(DEV_SERVER_ORIGIN)) {
			return true;
		}

		const pathname = url.pathname;

		return (
			pathname.includes('/@id/') ||
			pathname.includes('/@fs/') ||
			pathname.includes('/src/') ||
			pathname.includes('/node_modules/')
		);
	} catch {
		return false;
	}
};

const getViteStyleNodes = () =>
	Array.from(document.querySelectorAll(`style[${VITE_STYLE_ATTRIBUTE}]`));

const getViteLinkNodes = () =>
	Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter((link) => {
		if (link.hasAttribute(VITE_STYLE_ATTRIBUTE)) {
			return true;
		}

		return isViteStylesheetHref(link.href);
	});

const syncStylesToIframe = (iframeDoc, styleNodes, linkNodes) => {
	ensureMountPoint(iframeDoc);

	const head = iframeDoc.head || iframeDoc.documentElement;
	const activeStyleIds = new Set();

	for (const styleNode of styleNodes) {
		const viteId = styleNode.getAttribute(VITE_STYLE_ATTRIBUTE);

		if (!viteId) {
			continue;
		}

		activeStyleIds.add(viteId);

		const targetId = sanitizeId(viteId);
		let target = iframeDoc.getElementById(targetId);

		if (!target) {
			target = iframeDoc.createElement('style');
			target.id = targetId;
			target.setAttribute(VITE_STYLE_ATTRIBUTE, viteId);
			target.setAttribute(SYNC_MARKER_ATTRIBUTE, 'style-sync');
			target.setAttribute(STYLE_PRIORITY_ATTRIBUTE, 'high');
			head.appendChild(target);
		}

		if (target.textContent !== styleNode.textContent) {
			target.textContent = styleNode.textContent;
		}
	}

	const activeLinkIds = new Set();

	for (const linkNode of linkNodes) {
		const href = linkNode.href;

		if (!href) {
			continue;
		}

		const targetId = sanitizeId(`link-${href}`);
		activeLinkIds.add(targetId);

		let target = iframeDoc.getElementById(targetId);

		if (!target) {
			target = iframeDoc.createElement('link');
			target.id = targetId;
			target.setAttribute('rel', 'stylesheet');
			target.setAttribute(SYNC_MARKER_ATTRIBUTE, 'link-sync');
			head.appendChild(target);
		}

		if (target.href !== href) {
			target.href = href;
		}

		for (const attr of linkNode.getAttributeNames()) {
			if (attr === 'id' || attr === 'href') {
				continue;
			}

			const value = linkNode.getAttribute(attr);

			if (value !== null && target.getAttribute(attr) !== value) {
				target.setAttribute(attr, value);
			}
		}
	}

	if (styleNodes.length) {
		const syncedStyles = iframeDoc.querySelectorAll(
			`style[${SYNC_MARKER_ATTRIBUTE}="style-sync"]`
		);

		for (const node of syncedStyles) {
			const viteId = node.getAttribute(VITE_STYLE_ATTRIBUTE);

			if (!viteId || activeStyleIds.has(viteId)) {
				continue;
			}

			node.remove();
		}
	}

	if (linkNodes.length) {
		const syncedLinks = iframeDoc.querySelectorAll(
			`link[rel="stylesheet"][${SYNC_MARKER_ATTRIBUTE}="link-sync"]`
		);

		for (const node of syncedLinks) {
			if (activeLinkIds.has(node.id)) {
				continue;
			}

			node.remove();
		}
	}
};

const syncEditorStyles = () => {
	if (typeof document === 'undefined') {
		return;
	}

	const styleNodes = getViteStyleNodes();
	const linkNodes = getViteLinkNodes();

	if (!styleNodes.length && !linkNodes.length) {
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

		syncStylesToIframe(doc, styleNodes, linkNodes);
	}
};

const watchIframeHead = (iframe) => {
	const doc = iframe.contentDocument;

	if (!doc || !doc.head) {
		return;
	}

	const previousWatcher = iframeWatchers.get(iframe);

	if (previousWatcher && previousWatcher.doc === doc) {
		return;
	}

	if (previousWatcher) {
		previousWatcher.observer.disconnect();
	}

	const observer = new MutationObserver(() => {
		syncEditorStyles();
	});

	observer.observe(doc.head, { childList: true });
	iframeWatchers.set(iframe, { observer, doc });
};

const registerIframeListeners = (maybeSync) => {
	const iframes = findEditorIframes();

	for (const iframe of iframes) {
		if (!observedIframes.has(iframe)) {
			iframe.addEventListener('load', () => {
				watchIframeHead(iframe);
				maybeSync();
			});

			observedIframes.add(iframe);
		}

		watchIframeHead(iframe);
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
				'[trydo-wp-theme-bolierplate] Failed to sync editor styles from Vite.',
				error
			);
		}
	};

	maybeSync();

	const headObserver = new MutationObserver(maybeSync);
	headObserver.observe(document.head, {
		childList: true,
		subtree: true,
	});

	const bodyObserver = new MutationObserver(maybeSync);

	const observeBody = () => {
		if (!document.body) {
			return;
		}

		bodyObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener(
			'DOMContentLoaded',
			() => {
				observeBody();
				maybeSync();
				registerIframeListeners(maybeSync);
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
			registerIframeListeners(maybeSync);
		},
		{ once: true }
	);

	window.addEventListener('focus', maybeSync);

	registerIframeListeners(maybeSync);

	if (import.meta.hot) {
		import.meta.hot.on('vite:afterUpdate', maybeSync);
		import.meta.hot.on('vite:beforeFullReload', () => {
			headObserver.disconnect();
			bodyObserver.disconnect();
			iframeWatchers.forEach(({ observer }) => observer.disconnect());
			iframeWatchers.clear();
		});
	}
};

setupSync();
