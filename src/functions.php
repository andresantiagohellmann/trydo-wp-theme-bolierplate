<?php
/**
 * Theme bootstrap file responsible for integrating Vite.
 */

const TESTE_VITE_THEME_ENTRY = 'src/assets/main.js';
const TESTE_VITE_BLOCK_EDITOR_ENTRY = 'src/blocks/index.js';
const TESTE_VITE_EDITOR_ENTRY = 'src/assets/editor.js';

add_action('wp_enqueue_scripts', 'teste_enqueue_theme_assets');
add_action('enqueue_block_assets', 'teste_enqueue_theme_assets');
add_action('enqueue_block_editor_assets', 'teste_enqueue_theme_assets');
add_action('enqueue_block_editor_assets', 'teste_enqueue_block_editor_assets');
add_action('init', 'teste_register_blocks');
add_action('after_setup_theme', 'teste_setup_theme_support');
add_action('init', 'teste_setup_editor_styles');
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

    teste_vite_enqueue_entry(TESTE_VITE_THEME_ENTRY, 'teste-theme');
}

/**
 * Loads the Vite block editor bundle ensuring Tailwind styles are present in the editor.
 */
function teste_enqueue_block_editor_assets(): void
{
    static $enqueued = false;

    if ($enqueued) {
        return;
    }

    $enqueued = true;

    $dependencies = [
        'wp-blocks',
        'wp-element',
        'wp-i18n',
        'wp-block-editor',
        'wp-components',
    ];

    $origin = teste_vite_enqueue_entry(TESTE_VITE_BLOCK_EDITOR_ENTRY, 'teste-blocks-editor', $dependencies);

    if ($origin) {
        teste_vite_enqueue_entry(
            TESTE_VITE_EDITOR_ENTRY,
            'teste-editor-entry',
            [],
            $origin
        );
    }
}

/**
 * Enqueues a Vite entry point and its dependencies.
 */
function teste_vite_enqueue_entry(string $entry, string $handle, array $deps = [], ?string $origin = null): ?string
{
    $origin = $origin ?? teste_vite_dev_server_origin();

    if ($origin) {
        teste_vite_enqueue_dev_entry($origin, $entry, $handle, $deps);
        return $origin;
    }

    $manifest = teste_vite_manifest();

    if (! $manifest) {
        error_log(sprintf('[teste theme] Manifest not found while trying to enqueue "%s". Run "pnpm build".', $entry));
        return null;
    }

    teste_vite_enqueue_from_manifest($entry, $manifest, $handle, $deps);

    return null;
}

/**
 * Enqueues a dev server entry, ensuring the Vite client is only loaded once.
 */
function teste_vite_enqueue_dev_entry(string $origin, string $entry, string $handle, array $deps = []): void
{
    teste_vite_enqueue_client($origin);

    wp_enqueue_script($handle, "{$origin}/{$entry}", $deps, null, true);
    teste_vite_mark_module_script($handle);
}

/**
 * Enqueues the Vite HMR client when the dev server is active.
 */
function teste_vite_enqueue_client(string $origin): void
{
    static $client_enqueued = false;

    if ($client_enqueued) {
        return;
    }

    $client_handle = 'teste-vite-client';

    wp_enqueue_script($client_handle, "{$origin}/@vite/client", [], null, true);
    teste_vite_mark_module_script($client_handle);

    $client_enqueued = true;
}
/**
 * Recursively enqueue scripts and styles defined in the Vite manifest.
 *
 * @param array<string,mixed> $manifest
 */
function teste_vite_enqueue_from_manifest(string $entry, array $manifest, ?string $script_handle = null, array $deps = []): void
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

    $handle = $script_handle ?? 'teste-script-' . md5($item['file']);

    $script_deps = $script_handle ? $deps : [];

    wp_enqueue_script($handle, teste_vite_dist_url($item['file']), $script_deps, null, true);
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

    if (teste_vite_should_skip_dev_check()) {
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

    $success = ! is_wp_error($response)
        && 200 === (int) wp_remote_retrieve_response_code($response);

    if (! $success) {
        $success = teste_vite_can_connect_to_origin($origin);
    }

    $cache[$origin] = $success;

    return $cache[$origin];
}

/**
 * Attempts a low-level socket connection to determine if the dev server is reachable.
 */
function teste_vite_can_connect_to_origin(string $origin): bool
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
 * Resolves the absolute path to the active theme source directory.
 */
function teste_theme_src_path(): string
{
    return teste_theme_project_root_path() . '/src';
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
 * Registers all custom blocks located under src/blocks.
 */
function teste_register_blocks(): void
{
    $blocks_dir = teste_theme_src_path() . '/blocks';

    if (! is_dir($blocks_dir)) {
        return;
    }

    $block_json_files = glob($blocks_dir . '/*/block.json');

    if (! $block_json_files) {
        return;
    }

    foreach ($block_json_files as $block_json) {
        $block_dir = dirname($block_json);
        $render_path = $block_dir . '/render.php';

        $args = [];

        if (file_exists($render_path)) {
            $args['render_callback'] = static function (array $attributes, string $content, \WP_Block $block) use ($render_path) {
                return require $render_path;
            };
        }

        $result = register_block_type_from_metadata($block_dir, $args);

        if (is_wp_error($result)) {
            error_log(sprintf('[teste theme] Failed to register block from %s: %s', $block_dir, $result->get_error_message()));
        }
    }
}

/**
 * Declares theme supports required for proper editor integration.
 */
function teste_setup_theme_support(): void
{
    add_theme_support('editor-styles');
}

/**
 * Resolves the list of CSS URLs that must be loaded inside the block editor.
 *
 * @return string[]
 */
function teste_vite_resolve_editor_style_urls(): array
{
    $manifest = teste_vite_manifest();

    if (! $manifest) {
        return [];
    }

    $entries = [
        'src/assets/main.js',
        'src/blocks/index.js',
        'src/assets/editor.js',
    ];

    foreach ($entries as $entry) {
        if (empty($manifest[$entry]['css'])) {
            continue;
        }

        foreach ($manifest[$entry]['css'] as $css) {
            $styles[] = teste_vite_dist_url($css);
        }

        if (! empty($manifest[$entry]['file']) && teste_vite_asset_is_css((string) $manifest[$entry]['file'])) {
            $styles[] = teste_vite_dist_url($manifest[$entry]['file']);
        }
    }

    return array_values(array_unique($styles));
}

/**
 * Registers a filter to append editor styles dynamically on each request.
 */
function teste_setup_editor_styles(): void
{
    if (teste_vite_dev_server_origin()) {
        return;
    }

    $styles = teste_vite_resolve_editor_style_urls();

    if (! $styles) {
        return;
    }

    foreach ($styles as $style) {
        add_editor_style($style);
    }
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

/**
 * Determines whether the given asset path points to a CSS file.
 */
function teste_vite_asset_is_css(string $asset): bool
{
    return substr($asset, -4) === '.css';
}

/**
 * Determines whether the dev server availability check should be skipped.
 */
function teste_vite_should_skip_dev_check(): bool
{
    if (apply_filters('teste_vite_skip_dev_server_check', false)) {
        return true;
    }

    if (defined('TESTE_VITE_SKIP_DEV_CHECK') && TESTE_VITE_SKIP_DEV_CHECK) {
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

    if (defined('WP_DEBUG') && WP_DEBUG && ! file_exists(teste_vite_manifest_path())) {
        return true;
    }

    return false;
}
