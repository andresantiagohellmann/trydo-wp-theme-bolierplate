<?php

/**
 * Secure SVG Upload Support
 *
 * Enables safe SVG uploads with sanitization and validation.
 * No third-party plugins required.
 *
 * @package TrydoWPThemeBolierplate
 */

/**
 * Allow SVG uploads in WordPress media library
 *
 * @param array $mimes Existing allowed MIME types.
 *
 * @return array Modified MIME types with SVG support.
 */
function trydo_wp_theme_allow_svg_upload($mimes)
{
	// Only allow for users with upload_files capability (editors and admins)
	if (!current_user_can('upload_files')) {
		return $mimes;
	}

	$mimes['svg'] = 'image/svg+xml';
	$mimes['svgz'] = 'image/svg+xml';

	return $mimes;
}

/**
 * Sanitize SVG files on upload
 *
 * Uses DOMDocument to parse and clean SVG content, removing potentially
 * malicious scripts and dangerous elements.
 *
 * @param array $file Uploaded file data.
 *
 * @return array Modified file data or error.
 */
function trydo_wp_theme_sanitize_svg_upload($file)
{
	// Check if it's an SVG file
	if (!isset($file['tmp_name'])) {
		return $file;
	}

	$file_name = isset($file['name']) ? $file['name'] : '';
	$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

	if ($file_ext !== 'svg' && $file_ext !== 'svgz') {
		return $file;
	}

	// Get file content
	$svg_content = file_get_contents($file['tmp_name']);

	if ($svg_content === false) {
		$file['error'] = __('Failed to read SVG file.', 'trydo-wp-theme-bolierplate');
		return $file;
	}

	// Sanitize the SVG
	$sanitized_svg = trydo_wp_theme_sanitize_svg_content($svg_content);

	if ($sanitized_svg === false) {
		$file['error'] = __(
			'SVG file contains potentially malicious content and cannot be uploaded.',
			'trydo-wp-theme-bolierplate',
		);
		return $file;
	}

	// Save sanitized content back to temp file
	file_put_contents($file['tmp_name'], $sanitized_svg);

	return $file;
}

/**
 * Sanitize SVG content by removing dangerous elements and attributes
 *
 * @param string $svg_content Raw SVG content.
 *
 * @return string|false Sanitized SVG content or false on failure.
 */
function trydo_wp_theme_sanitize_svg_content($svg_content)
{
	// Validate that it's actually XML/SVG
	if (!preg_match('/<svg[^>]*>/i', $svg_content)) {
		return false;
	}

	// List of allowed SVG tags
	$allowed_tags = [
		'svg',
		'g',
		'path',
		'circle',
		'rect',
		'ellipse',
		'line',
		'polyline',
		'polygon',
		'text',
		'tspan',
		'defs',
		'linearGradient',
		'radialGradient',
		'stop',
		'clipPath',
		'mask',
		'pattern',
		'use',
		'symbol',
		'title',
		'desc',
		'metadata',
		'image',
		'filter',
		'feGaussianBlur',
		'feOffset',
		'feBlend',
		'feColorMatrix',
		'feComponentTransfer',
		'feComposite',
		'feConvolveMatrix',
		'feDiffuseLighting',
		'feDisplacementMap',
		'feFlood',
		'feGaussianBlur',
		'feImage',
		'feMerge',
		'feMergeNode',
		'feMorphology',
		'feOffset',
		'feSpecularLighting',
		'feTile',
		'feTurbulence',
		'animate',
		'animateTransform',
		'animateMotion',
	];

	// List of allowed attributes (basic safe attributes)
	$allowed_attrs = [
		'class',
		'id',
		'width',
		'height',
		'viewBox',
		'xmlns',
		'xmlns:xlink',
		'x',
		'y',
		'cx',
		'cy',
		'r',
		'rx',
		'ry',
		'fill',
		'stroke',
		'stroke-width',
		'stroke-linecap',
		'stroke-linejoin',
		'stroke-dasharray',
		'stroke-dashoffset',
		'opacity',
		'fill-opacity',
		'stroke-opacity',
		'transform',
		'd',
		'points',
		'x1',
		'y1',
		'x2',
		'y2',
		'gradientUnits',
		'gradientTransform',
		'offset',
		'stop-color',
		'stop-opacity',
		'xlink:href',
		'preserveAspectRatio',
		'font-family',
		'font-size',
		'font-weight',
		'text-anchor',
		'style',
	];

	// Dangerous patterns to block
	$dangerous_patterns = [
		'/<script[\s\S]*?<\/script>/i',
		'/on\w+\s*=/i', // Event handlers like onclick, onload, etc.
		'/javascript:/i',
		'/data:text\/html/i',
		'/<iframe/i',
		'/<embed/i',
		'/<object/i',
		'/<foreignObject/i',
	];

	// Check for dangerous patterns
	foreach ($dangerous_patterns as $pattern) {
		if (preg_match($pattern, $svg_content)) {
			return false;
		}
	}

	// Use DOMDocument for proper XML parsing
	$dom = new DOMDocument();
	$dom->formatOutput = false;
	$dom->preserveWhiteSpace = true;
	$dom->strictErrorChecking = false;

	// Suppress warnings for malformed SVG
	libxml_use_internal_errors(true);

	// Load SVG content
	if (!$dom->loadXML($svg_content)) {
		libxml_clear_errors();
		return false;
	}

	libxml_clear_errors();

	// Get all elements
	$xpath = new DOMXPath($dom);
	$all_elements = $xpath->query('//*');

	foreach ($all_elements as $element) {
		// Check if tag is allowed
		if (!in_array(strtolower($element->tagName), $allowed_tags, true)) {
			$element->parentNode->removeChild($element);
			continue;
		}

		// Check attributes
		if ($element->hasAttributes()) {
			$attrs_to_remove = [];

			foreach ($element->attributes as $attr) {
				$attr_name = strtolower($attr->name);

				// Remove disallowed attributes
				if (!in_array($attr_name, $allowed_attrs, true)) {
					$attrs_to_remove[] = $attr_name;
					continue;
				}

				// Extra check for attribute values
				$attr_value = $attr->value;
				if (
					preg_match('/javascript:/i', $attr_value) ||
					preg_match('/data:text\/html/i', $attr_value)
				) {
					$attrs_to_remove[] = $attr_name;
				}
			}

			// Remove dangerous attributes
			foreach ($attrs_to_remove as $attr_name) {
				$element->removeAttribute($attr_name);
			}
		}
	}

	// Return sanitized SVG
	return $dom->saveXML();
}

/**
 * Fix SVG MIME type check for WordPress
 *
 * WordPress does a secondary MIME type check that can fail for SVGs.
 * This function fixes that issue.
 *
 * @param array $data File data.
 * @param string $file File path.
 * @param string $filename File name.
 * @param array $mimes Allowed MIME types.
 *
 * @return array Modified file data.
 */
function trydo_wp_theme_fix_svg_mime_type($data, $file, $filename, $mimes)
{
	$file_ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

	if ($file_ext === 'svg' || $file_ext === 'svgz') {
		$data['ext'] = 'svg';
		$data['type'] = 'image/svg+xml';
	}

	return $data;
}

/**
 * Add SVG preview in media library
 *
 * @param string $response Default response.
 * @param object $attachment Attachment object.
 * @param array $meta Attachment meta data.
 *
 * @return string Modified response with SVG preview.
 */
function trydo_wp_theme_svg_media_preview($response, $attachment, $meta)
{
	if ($response['type'] === 'image' && $response['subtype'] === 'svg+xml') {
		$response['image'] = [
			'src' => $response['url'],
		];

		// Add dimensions if available
		$svg_path = get_attached_file($attachment->ID);
		if ($svg_path && file_exists($svg_path)) {
			$svg_content = file_get_contents($svg_path);
			if (preg_match('/viewBox=["\']([0-9.\s-]+)["\']/i', $svg_content, $viewbox_matches)) {
				$viewbox = explode(' ', $viewbox_matches[1]);
				if (count($viewbox) === 4) {
					$response['width'] = (int) $viewbox[2];
					$response['height'] = (int) $viewbox[3];
					$response['image']['width'] = (int) $viewbox[2];
					$response['image']['height'] = (int) $viewbox[3];
				}
			}
		}
	}

	return $response;
}

/**
 * Display SVG thumbnails in media library
 *
 * @param string $content Default content.
 * @param int $post_id Post ID.
 *
 * @return string Modified content with SVG display.
 */
function trydo_wp_theme_svg_thumbnail_display($content, $post_id)
{
	$mime = get_post_mime_type($post_id);

	if ($mime === 'image/svg+xml') {
		$attachment_url = wp_get_attachment_url($post_id);
		$content = sprintf(
			'<img src="%s" style="width: 100%%; height: auto;" />',
			esc_url($attachment_url),
		);
	}

	return $content;
}

/**
 * Add SVG dimensions metadata
 *
 * @param array $metadata Attachment metadata.
 * @param int $attachment_id Attachment ID.
 *
 * @return array Modified metadata.
 */
function trydo_wp_theme_svg_metadata($metadata, $attachment_id)
{
	$mime = get_post_mime_type($attachment_id);

	if ($mime === 'image/svg+xml') {
		$svg_path = get_attached_file($attachment_id);

		if ($svg_path && file_exists($svg_path)) {
			$svg_content = file_get_contents($svg_path);

			// Try to extract viewBox dimensions
			if (preg_match('/viewBox=["\']([0-9.\s-]+)["\']/i', $svg_content, $viewbox_matches)) {
				$viewbox = explode(' ', $viewbox_matches[1]);
				if (count($viewbox) === 4) {
					$metadata['width'] = (int) $viewbox[2];
					$metadata['height'] = (int) $viewbox[3];
				}
			} elseif (
				preg_match('/width=["\']([0-9.]+)/', $svg_content, $width_matches) &&
				preg_match('/height=["\']([0-9.]+)/', $svg_content, $height_matches)
			) {
				// Fallback to width/height attributes
				$metadata['width'] = (int) $width_matches[1];
				$metadata['height'] = (int) $height_matches[1];
			}
		}
	}

	return $metadata;
}
