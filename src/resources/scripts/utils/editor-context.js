/**
 * Editor Context Detection Utilities
 *
 * Helper functions to detect if code is running in the WordPress block editor
 * vs the front-end. Useful for conditional execution in viewScript files.
 *
 * @example
 * import { isInEditor } from '@/resources/scripts/utils/editor-context';
 *
 * // Run only on front-end
 * if (!isInEditor()) {
 *   trackAnalytics();
 *   openModal();
 * }
 *
 * // Run in both editor and front-end
 * initSlideshow();
 */

/**
 * Detects if the current script is running inside the WordPress block editor.
 *
 * This function checks multiple indicators:
 * 1. Body classes (.block-editor-*, .editor-styles-wrapper)
 * 2. iframe context (editor uses iframes since WP 6.2)
 * 3. Parent window has wp.blocks (Gutenberg API)
 *
 * @returns {boolean} True if running in the editor, false otherwise
 */
export function isInEditor() {
	// Method 1: Check body classes (most reliable)
	const bodyClasses = document.body.className;
	if (
		bodyClasses.includes('block-editor') ||
		bodyClasses.includes('editor-styles-wrapper') ||
		bodyClasses.includes('wp-admin')
	) {
		return true;
	}

	// Method 2: Check if inside iframe (editor uses iframes)
	try {
		if (window.self !== window.top) {
			// We're in an iframe
			// Check if parent has WordPress editor globals
			if (window.parent && (window.parent.wp?.blocks || window.parent.wp?.blockEditor)) {
				return true;
			}
		}
	} catch {
		// Cross-origin iframe - likely not the editor
		return false;
	}

	// Method 3: Check for Gutenberg globals in current window
	if (window.wp?.blocks || window.wp?.blockEditor) {
		return true;
	}

	return false;
}

/**
 * Detects if the current script is running on the front-end (not in editor).
 *
 * @returns {boolean} True if running on front-end, false if in editor
 */
export function isInFrontend() {
	return !isInEditor();
}

/**
 * Executes a callback only if running in the editor.
 *
 * @param {Function} callback - Function to execute in editor context
 * @example
 * onlyInEditor(() => {
 *   console.log('This runs only in the editor');
 * });
 */
export function onlyInEditor(callback) {
	if (isInEditor()) {
		callback();
	}
}

/**
 * Executes a callback only if running on the front-end.
 *
 * @param {Function} callback - Function to execute in front-end context
 * @example
 * onlyInFrontend(() => {
 *   trackAnalytics();
 *   openModal();
 * });
 */
export function onlyInFrontend(callback) {
	if (isInFrontend()) {
		callback();
	}
}
