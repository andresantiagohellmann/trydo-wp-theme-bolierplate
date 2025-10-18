<?php
/**
 * Theme bootstrap file responsible for integrating Vite.
 */

const TESTE_VITE_ENTRY = 'src/assets/main.js';

add_action('wp_enqueue_scripts', 'teste_enqueue_theme_assets');
add_action('enqueue_block_assets', 'teste_enqueue_theme_assets');
add_action('enqueue_block_editor_assets', 'teste_enqueue_theme_assets');
add_filter('script_loader_tag', 'teste_vite_force_module_type', 10, 3);

/**
 * Ensures the Vite-powered assets are loaded only once per request.
 */
function teste_enqueue_theme_assets(): void
{
    static $enqueued = false;

    if ($enqueued) {
        return;
    }

    $enqueued = true;

    $dev_origin = teste_vite_dev_server_origin();

    if ($dev_origin) {
        teste_enqueue_vite_dev_assets($dev_origin);
        return;
    }

    $manifest = teste_vite_manifest();

    if (! $manifest) {
        error_log('[teste theme] Vite manifest not found. Did you run "pnpm build"?');
        return;
    }

    teste_enqueue_vite_built_assets($manifest);
}

/**
 * Enqueue assets when the Vite dev server is running.
 */
function teste_enqueue_vite_dev_assets(string $origin): void
{
    $client_handle = 'teste-vite-client';
    $entry_handle = 'teste-vite-entry';

    wp_enqueue_script($client_handle, "{$origin}/@vite/client", [], null, true);
    teste_vite_mark_module_script($client_handle);

    $entry = TESTE_VITE_ENTRY;

    wp_enqueue_script($entry_handle, "{$origin}/{$entry}", [], null, true);
    teste_vite_mark_module_script($entry_handle);
}

/**
 * Enqueue assets produced by Vite build using the manifest file.
 *
 * @param array<string,mixed> $manifest
 */
function teste_enqueue_vite_built_assets(array $manifest): void
{
    teste_vite_enqueue_from_manifest(TESTE_VITE_ENTRY, $manifest);
}

/**
 * Recursively enqueue scripts and styles defined in the Vite manifest.
 *
 * @param array<string,mixed> $manifest
 */
function teste_vite_enqueue_from_manifest(string $entry, array $manifest): void
{
    static $scripts = [];
    static $styles = [];

    if (! isset($manifest[$entry])) {
        return;
    }

    $item = $manifest[$entry];

    foreach ($item['imports'] ?? [] as $import) {
        teste_vite_enqueue_from_manifest($import, $manifest);
    }

    foreach ($item['css'] ?? [] as $css) {
        if (isset($styles[$css])) {
            continue;
        }

        $handle = 'teste-style-' . md5($css);

        wp_enqueue_style($handle, teste_vite_dist_url($css), [], null);

        $styles[$css] = true;
    }

    if (empty($item['file']) || isset($scripts[$item['file']])) {
        return;
    }

    $handle = 'teste-script-' . md5($item['file']);

    wp_enqueue_script($handle, teste_vite_dist_url($item['file']), [], null, true);
    teste_vite_mark_module_script($handle);

    $scripts[$item['file']] = true;
}

/**
 * Attempts to detect the Vite dev server origin.
 */
function teste_vite_dev_server_origin(): ?string
{
    if (defined('TESTE_VITE_FORCE_PROD') && TESTE_VITE_FORCE_PROD) {
        return null;
    }

    $origin = getenv('WP_VITE_SERVER')
        ?: (defined('TESTE_VITE_SERVER') ? TESTE_VITE_SERVER : 'http://127.0.0.1:5173');

    $origin = rtrim((string) $origin, '/');
    $origin = apply_filters('teste_vite_dev_server_origin', $origin);

    if (! $origin) {
        return null;
    }

    if (apply_filters('teste_vite_skip_dev_server_check', false)) {
        return $origin;
    }

    return teste_vite_is_dev_server_running($origin) ? $origin : null;
}

/**
 * Checks if the Vite dev server responds.
 */
function teste_vite_is_dev_server_running(string $origin): bool
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

    $cache[$origin] = ! is_wp_error($response)
        && 200 === (int) wp_remote_retrieve_response_code($response);

    return $cache[$origin];
}

/**
 * Reads and caches the Vite manifest file.
 *
 * @return array<string,mixed>|null
 */
function teste_vite_manifest(): ?array
{
    static $manifest = null;
    static $loaded = false;

    if ($loaded) {
        return $manifest;
    }

    $path = teste_vite_manifest_path();

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
 * Returns the absolute filesystem path to the Vite manifest.
 */
function teste_vite_manifest_path(): string
{
    return teste_theme_project_root_path() . '/dist/manifest.json';
}

/**
 * Resolves the absolute path to the theme project root (one level above /src when applicable).
 */
function teste_theme_project_root_path(): string
{
    $path = wp_normalize_path(get_stylesheet_directory());

    if (substr($path, -4) === '/src') {
        $path = substr($path, 0, -4);
    }

    return rtrim($path, '/');
}

/**
 * Resolves the public URI to the theme project root.
 */
function teste_theme_project_root_uri(): string
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
function teste_vite_dist_url(string $asset): string
{
    $asset = ltrim($asset, '/');

    return teste_theme_project_root_uri() . '/dist/' . $asset;
}

/**
 * Ensures the provided script handle is printed with type="module".
 */
function teste_vite_mark_module_script(string $handle): void
{
    wp_script_add_data($handle, 'type', 'module');

    if (! isset($GLOBALS['teste_vite_module_handles'])) {
        $GLOBALS['teste_vite_module_handles'] = [];
    }

    $GLOBALS['teste_vite_module_handles'][$handle] = true;
}

/**
 * Filters script tags to ensure module type is honoured by browsers.
 */
function teste_vite_force_module_type(string $tag, string $handle, string $src): string
{
    if (empty($GLOBALS['teste_vite_module_handles'][$handle])) {
        return $tag;
    }

    if (false !== strpos($tag, 'type=')) {
        $tag = preg_replace('/\s+type=([\'"]).*?\1/', '', $tag);
    }

    return str_replace('<script', '<script type="module"', $tag);
}
