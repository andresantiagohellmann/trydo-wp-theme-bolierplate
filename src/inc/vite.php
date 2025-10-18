<?php

/**
 * Resolves the absolute path to the theme project root (one level above /src when applicable).
 */
function trydo_wp_theme_bolierplate_theme_project_root_path(): string
{
    $path = wp_normalize_path(get_stylesheet_directory());

    if (substr($path, -4) === '/src') {
        $path = substr($path, 0, -4);
    }

    return rtrim($path, '/');
}

/**
 * Resolves the absolute path to the active theme source directory.
 */
function trydo_wp_theme_bolierplate_theme_src_path(): string
{
    return trydo_wp_theme_bolierplate_theme_project_root_path() . '/src';
}

/**
 * Resolves the public URI to the theme project root.
 */
function trydo_wp_theme_bolierplate_theme_project_root_uri(): string
{
    $uri = get_stylesheet_directory_uri();

    if (substr($uri, -4) === '/src') {
        $uri = substr($uri, 0, -4);
    }

    return rtrim($uri, '/');
}

/**
 * Builds the public URL for an asset inside the Vite dist directory.
 */
function trydo_wp_theme_bolierplate_vite_dist_url(string $asset): string
{
    $asset = ltrim($asset, '/');

    return trydo_wp_theme_bolierplate_theme_project_root_uri() . '/dist/' . $asset;
}

/**
 * Returns the absolute filesystem path to the Vite manifest.
 */
function trydo_wp_theme_bolierplate_vite_manifest_path(): string
{
    return trydo_wp_theme_bolierplate_theme_project_root_path() . '/dist/manifest.json';
}

/**
 * Reads and caches the Vite manifest file.
 *
 * @return array<string,mixed>|null
 */
function trydo_wp_theme_bolierplate_vite_manifest(): ?array
{
    static $manifest = null;
    static $loaded = false;

    if ($loaded) {
        return $manifest;
    }

    $path = trydo_wp_theme_bolierplate_vite_manifest_path();

    if (file_exists($path)) {
        $contents = file_get_contents($path);
        $decoded = json_decode((string) $contents, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $manifest = $decoded;
        }
    }

    $loaded = true;

    return $manifest;
}

/**
 * Attempts to detect the Vite dev server origin.
 */
function trydo_wp_theme_bolierplate_vite_dev_server_origin(): ?string
{
    if (defined('TRYDO_WP_THEME_BOLIERPLATE_VITE_FORCE_PROD') && TRYDO_WP_THEME_BOLIERPLATE_VITE_FORCE_PROD) {
        return null;
    }

    $origin = getenv('WP_VITE_SERVER')
        ?: (defined('TRYDO_WP_THEME_BOLIERPLATE_VITE_SERVER') ? TRYDO_WP_THEME_BOLIERPLATE_VITE_SERVER : 'http://127.0.0.1:5173');

    $origin = rtrim((string) $origin, '/');
    $origin = apply_filters('trydo_wp_theme_bolierplate_vite_dev_server_origin', $origin);

    if (! $origin) {
        return null;
    }

    if (trydo_wp_theme_bolierplate_vite_should_skip_dev_check()) {
        return $origin;
    }

    return trydo_wp_theme_bolierplate_vite_is_dev_server_running($origin) ? $origin : null;
}

/**
 * Checks if the Vite dev server responds.
 */
function trydo_wp_theme_bolierplate_vite_is_dev_server_running(string $origin): bool
{
    static $cache = [];

    if (array_key_exists($origin, $cache)) {
        return $cache[$origin];
    }

    $response = wp_remote_get(
        "{$origin}/@vite/client",
        [
            'timeout' => 1.0,
            'sslverify' => false,
        ]
    );

    $success = ! is_wp_error($response)
        && 200 === (int) wp_remote_retrieve_response_code($response);

    if (! $success) {
        $success = trydo_wp_theme_bolierplate_vite_can_connect_to_origin($origin);
    }

    $cache[$origin] = $success;

    return $cache[$origin];
}

/**
 * Attempts a low-level socket connection to determine if the dev server is reachable.
 */
function trydo_wp_theme_bolierplate_vite_can_connect_to_origin(string $origin): bool
{
    $parsed = wp_parse_url($origin);

    if (empty($parsed['host'])) {
        return false;
    }

    $scheme = $parsed['scheme'] ?? 'http';
    $port = $parsed['port'] ?? ('https' === $scheme ? 443 : 80);
    $transport = 'https' === $scheme ? 'ssl://' : 'tcp://';

    $socket = @stream_socket_client(
        "{$transport}{$parsed['host']}:{$port}",
        $errno,
        $errstr,
        0.3
    );

    if ($socket) {
        fclose($socket);
        return true;
    }

    return false;
}

/**
 * Determines whether the given asset path points to a CSS file.
 */
function trydo_wp_theme_bolierplate_vite_asset_is_css(string $asset): bool
{
    return substr($asset, -4) === '.css';
}

/**
 * Determines whether the dev server availability check should be skipped.
 */
function trydo_wp_theme_bolierplate_vite_should_skip_dev_check(): bool
{
    if (apply_filters('trydo_wp_theme_bolierplate_vite_skip_dev_server_check', false)) {
        return true;
    }

    if (defined('TRYDO_WP_THEME_BOLIERPLATE_VITE_SKIP_DEV_CHECK') && TRYDO_WP_THEME_BOLIERPLATE_VITE_SKIP_DEV_CHECK) {
        return true;
    }

    $env = getenv('WP_VITE_SKIP_CHECK');

    if (false !== $env) {
        $normalized = strtolower(trim((string) $env));

        if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
            return true;
        }
    }

    if (defined('WP_ENVIRONMENT_TYPE') && 'development' === WP_ENVIRONMENT_TYPE) {
        return true;
    }

    if (defined('WP_DEBUG') && WP_DEBUG && ! file_exists(trydo_wp_theme_bolierplate_vite_manifest_path())) {
        return true;
    }

    return false;
}

