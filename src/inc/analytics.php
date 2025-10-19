<?php
/**
 * Analytics integration helpers.
 *
 * Adds a settings screen that lets administrators paste an analytics snippet
 * (Google Analytics, Matomo, Meta Pixel, etc.) without relying on external plugins.
 * The snippet is stored in an option and rendered on the front end only when
 * permitted (e.g., production environment + consent filters).
 */

if (!defined('ABSPATH')) {
	exit();
}

/**
 * Option name used to persist analytics settings.
 */
const TRYDO_WP_THEME_BOLIERPLATE_ANALYTICS_OPTION = 'trydo_wp_theme_bolierplate_analytics';

/**
 * Registers settings, fields, and the analytics admin screen.
 */
function trydo_wp_theme_bolierplate_register_analytics_module(): void
{
	add_action('admin_menu', 'trydo_wp_theme_bolierplate_register_analytics_menu');
	add_action('admin_init', 'trydo_wp_theme_bolierplate_register_analytics_settings');
	add_action('admin_enqueue_scripts', 'trydo_wp_theme_bolierplate_maybe_enqueue_code_editor');

	add_action('wp_head', 'trydo_wp_theme_bolierplate_maybe_render_analytics_in_head', 20);
	add_action('wp_footer', 'trydo_wp_theme_bolierplate_maybe_render_analytics_in_footer', 20);
	add_action(
		'trydo_wp_theme_bolierplate_analytics',
		'trydo_wp_theme_bolierplate_render_analytics_snippet',
		10,
		1,
	);
}

/**
 * Adds the analytics submenu under Appearance.
 */
function trydo_wp_theme_bolierplate_register_analytics_menu(): void
{
	add_theme_page(
		__('Analytics & Integrations', 'trydo-wp-theme-bolierplate'),
		__('Analytics', 'trydo-wp-theme-bolierplate'),
		'manage_options',
		'trydo-wp-theme-bolierplate-analytics',
		'trydo_wp_theme_bolierplate_render_analytics_settings_page',
	);
}

/**
 * Registers the analytics option and its fields.
 */
function trydo_wp_theme_bolierplate_register_analytics_settings(): void
{
	register_setting(
		'trydo_wp_theme_bolierplate_analytics',
		TRYDO_WP_THEME_BOLIERPLATE_ANALYTICS_OPTION,
		[
			'type' => 'array',
			'sanitize_callback' => 'trydo_wp_theme_bolierplate_sanitize_analytics_settings',
			'default' => trydo_wp_theme_bolierplate_default_analytics_settings(),
		],
	);

	add_settings_section(
		'trydo_wp_theme_bolierplate_analytics_main',
		__('Tracking Snippets', 'trydo-wp-theme-bolierplate'),
		function (): void {
			echo '<p>' .
				esc_html__(
					'Cole os trechos fornecidos pela sua ferramenta de analytics (Gtag, Matomo, Meta Pixel, etc.). Muitos provedores entregam um trecho para o cabeçalho e outro para o rodapé.',
					'trydo-wp-theme-bolierplate',
				) .
				'</p>';
		},
		'trydo_wp_theme_bolierplate_analytics',
	);

	add_settings_field(
		'trydo_wp_theme_bolierplate_analytics_head_snippet',
		__('Snippet do cabeçalho (wp_head)', 'trydo-wp-theme-bolierplate'),
		'trydo_wp_theme_bolierplate_render_head_snippet_field',
		'trydo_wp_theme_bolierplate_analytics',
		'trydo_wp_theme_bolierplate_analytics_main',
	);

	add_settings_field(
		'trydo_wp_theme_bolierplate_analytics_footer_snippet',
		__('Snippet do rodapé (wp_footer)', 'trydo-wp-theme-bolierplate'),
		'trydo_wp_theme_bolierplate_render_footer_snippet_field',
		'trydo_wp_theme_bolierplate_analytics',
		'trydo_wp_theme_bolierplate_analytics_main',
	);

	add_settings_field(
		'trydo_wp_theme_bolierplate_analytics_production_only',
		__('Carregar apenas em produção', 'trydo-wp-theme-bolierplate'),
		'trydo_wp_theme_bolierplate_render_production_only_field',
		'trydo_wp_theme_bolierplate_analytics',
		'trydo_wp_theme_bolierplate_analytics_main',
	);
}

/**
 * Enqueues the code editor (CodeMirror) when the analytics settings screen is loaded.
 */
function trydo_wp_theme_bolierplate_maybe_enqueue_code_editor(string $hook_suffix): void
{
	if ('appearance_page_trydo-wp-theme-bolierplate-analytics' !== $hook_suffix) {
		return;
	}

	$settings = wp_enqueue_code_editor([
		'type' => 'text/html',
	]);

	if (false === $settings) {
		return;
	}

	wp_add_inline_script(
		'code-editor',
		sprintf(
			'(function(){var editorSettings=%s;var fieldIds=["trydo-wp-theme-bolierplate-analytics-head-snippet","trydo-wp-theme-bolierplate-analytics-footer-snippet"];function init(){if(!window.wp||!wp.codeEditor){return;}fieldIds.forEach(function(id){var field=document.getElementById(id);if(!field){return;}if(field.dataset.trydoEditorInitialized){return;}field.dataset.trydoEditorInitialized="1";wp.codeEditor.initialize(id,editorSettings);});}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}})();',
			wp_json_encode($settings),
		),
		'after',
	);
}

/**
 * Default analytics settings.
 */
function trydo_wp_theme_bolierplate_default_analytics_settings(): array
{
	return [
		'head_snippet' => '',
		'footer_snippet' => '',
		'production_only' => true,
	];
}

/**
 * Retrieves analytics settings merged with defaults.
 */
function trydo_wp_theme_bolierplate_get_analytics_settings(): array
{
	$settings = get_option(TRYDO_WP_THEME_BOLIERPLATE_ANALYTICS_OPTION, []);

	if (!is_array($settings)) {
		$settings = [];
	}

	return wp_parse_args($settings, trydo_wp_theme_bolierplate_default_analytics_settings());
}

/**
 * Sanitizes analytics settings before saving.
 *
 * @param array<string,mixed> $input Raw input.
 */
function trydo_wp_theme_bolierplate_sanitize_analytics_settings($input): array
{
	$defaults = trydo_wp_theme_bolierplate_default_analytics_settings();
	$sanitized = [
		'head_snippet' => '',
		'footer_snippet' => '',
		'production_only' => (bool) $defaults['production_only'],
	];

	if (is_array($input)) {
		if (isset($input['head_snippet'])) {
			$sanitized['head_snippet'] = trydo_wp_theme_bolierplate_sanitize_analytics_snippet(
				$input['head_snippet'],
			);
		}

		if (isset($input['footer_snippet'])) {
			$sanitized['footer_snippet'] = trydo_wp_theme_bolierplate_sanitize_analytics_snippet(
				$input['footer_snippet'],
			);
		}

		$sanitized['production_only'] = !empty($input['production_only']);
	}

	return $sanitized;
}

/**
 * Sanitizes the snippet, allowing script-related tags and attributes.
 *
 * @param string $snippet Raw snippet pasted by the user.
 */
function trydo_wp_theme_bolierplate_sanitize_analytics_snippet($snippet): string
{
	$snippet = wp_kses(trim((string) $snippet), [
		'script' => [
			'async' => true,
			'defer' => true,
			'type' => true,
			'src' => true,
			'id' => true,
			'nonce' => true,
			'crossorigin' => true,
			'integrity' => true,
			'referrerpolicy' => true,
			'data-*' => true,
		],
		'noscript' => [
			'id' => true,
			'class' => true,
			'style' => true,
			'data-*' => true,
		],
		'img' => [
			'src' => true,
			'height' => true,
			'width' => true,
			'style' => true,
			'alt' => true,
			'referrerpolicy' => true,
		],
		'iframe' => [
			'src' => true,
			'height' => true,
			'width' => true,
			'style' => true,
			'title' => true,
			'loading' => true,
			'referrerpolicy' => true,
			'allow' => true,
			'allowfullscreen' => true,
		],
		'style' => [
			'type' => true,
			'media' => true,
			'id' => true,
			'data-*' => true,
		],
	]);

	return $snippet;
}

/**
 * Renders the textarea field for the head analytics snippet.
 */
function trydo_wp_theme_bolierplate_render_head_snippet_field(): void
{
	$settings = trydo_wp_theme_bolierplate_get_analytics_settings();
	$field_id = 'trydo-wp-theme-bolierplate-analytics-head-snippet';

	printf(
		'<textarea id="%1$s" name="%2$s[head_snippet]" rows="12" class="large-text code" aria-describedby="%3$s">%4$s</textarea>',
		esc_attr($field_id),
		esc_attr(TRYDO_WP_THEME_BOLIERPLATE_ANALYTICS_OPTION),
		esc_attr($field_id . '-description'),
		esc_textarea($settings['head_snippet']),
	);

	printf(
		'<p id="%1$s" class="description">%2$s</p>',
		esc_attr($field_id . '-description'),
		esc_html__(
			'Aceita tags <script>, <noscript>, <img> e <iframe>. Use o snippet completo fornecido pela sua ferramenta.',
			'trydo-wp-theme-bolierplate',
		),
	);
}

/**
 * Renders the textarea field for the footer analytics snippet.
 */
function trydo_wp_theme_bolierplate_render_footer_snippet_field(): void
{
	$settings = trydo_wp_theme_bolierplate_get_analytics_settings();
	$field_id = 'trydo-wp-theme-bolierplate-analytics-footer-snippet';

	printf(
		'<textarea id="%1$s" name="%2$s[footer_snippet]" rows="8" class="large-text code" aria-describedby="%3$s">%4$s</textarea>',
		esc_attr($field_id),
		esc_attr(TRYDO_WP_THEME_BOLIERPLATE_ANALYTICS_OPTION),
		esc_attr($field_id . '-description'),
		esc_textarea($settings['footer_snippet']),
	);

	printf(
		'<p id="%1$s" class="description">%2$s</p>',
		esc_attr($field_id . '-description'),
		esc_html__(
			'Trechos auxiliares (por exemplo, <script> adicional, <noscript> ou pixels) que devem ficar no rodapé.',
			'trydo-wp-theme-bolierplate',
		),
	);
}

/**
 * Renders the checkbox for the production-only toggle.
 */
function trydo_wp_theme_bolierplate_render_production_only_field(): void
{
	$settings = trydo_wp_theme_bolierplate_get_analytics_settings();

	printf(
		'<label><input type="checkbox" name="%1$s[production_only]" value="1"%2$s> %3$s</label>',
		esc_attr(TRYDO_WP_THEME_BOLIERPLATE_ANALYTICS_OPTION),
		checked($settings['production_only'], true, false),
		esc_html__(
			'Ativar somente quando o ambiente estiver definido como produção.',
			'trydo-wp-theme-bolierplate',
		),
	);

	$environment = function_exists('wp_get_environment_type')
		? wp_get_environment_type()
		: 'production';

	printf(
		'<p class="description">%s %s</p>',
		esc_html__('Ambiente atual detectado:', 'trydo-wp-theme-bolierplate'),
		esc_html($environment),
	);
}

/**
 * Renders the analytics settings page wrapper.
 */
function trydo_wp_theme_bolierplate_render_analytics_settings_page(): void
{
	if (!current_user_can('manage_options')) {
		return;
	} ?>
	<div class="wrap">
		<h1><?php esc_html_e('Analytics & Integrations', 'trydo-wp-theme-bolierplate'); ?></h1>
		<form action="<?php echo esc_url(admin_url('options.php')); ?>" method="post">
			<?php
   settings_fields('trydo_wp_theme_bolierplate_analytics');
	do_settings_sections('trydo_wp_theme_bolierplate_analytics');
	submit_button(__('Salvar configurações', 'trydo-wp-theme-bolierplate'));
	?>
		</form>
		<hr>
		<p>
			<?php esc_html_e(
				'Use o filtro "trydo_wp_theme_bolierplate_allow_analytics" para controlar quando o snippet é exibido (ideal para consent mode).',
				'trydo-wp-theme-bolierplate',
			); ?>
		</p>
		<p>
			<?php esc_html_e(
				'Você também pode usar a action "trydo_wp_theme_bolierplate_analytics" passando "head" ou "footer" para acionar a renderização manualmente.',
				'trydo-wp-theme-bolierplate',
			); ?>
		</p>
	</div>
	<?php
}

/**
 * Determines whether the analytics snippet should be output.
 */
function trydo_wp_theme_bolierplate_should_render_analytics(): bool
{
	$settings = trydo_wp_theme_bolierplate_get_analytics_settings();

	if ('' === trim($settings['head_snippet']) && '' === trim($settings['footer_snippet'])) {
		return false;
	}

	if (
		!empty($settings['production_only']) &&
		'production' !== trydo_wp_theme_bolierplate_current_environment()
	) {
		return false;
	}

	/**
	 * Filter whether the analytics snippet is allowed to render.
	 *
	 * This enables consent management flows to disable analytics until the user agrees.
	 *
	 * @param bool $allowed Whether analytics are allowed.
	 * @param array $settings Current analytics settings.
	 */
	$allowed = apply_filters('trydo_wp_theme_bolierplate_allow_analytics', true, $settings);

	return (bool) $allowed;
}

/**
 * Renders the analytics snippet directly (used by hooks and the public action).
 */
function trydo_wp_theme_bolierplate_render_analytics_snippet(): void
{
	if (!trydo_wp_theme_bolierplate_should_render_analytics()) {
		return;
	}

	$args = func_get_args();
	$context = $args[0] ?? 'head';
	$settings = is_array($args[1] ?? null)
		? $args[1]
		: trydo_wp_theme_bolierplate_get_analytics_settings();
	$snippet = trydo_wp_theme_bolierplate_get_snippet_by_context($context, $settings);

	if ('' === trim($snippet)) {
		return;
	}

	/**
	 * Filter the final analytics snippet before rendering.
	 *
	 * @param string $snippet Analytics snippet contents.
	 * @param array $settings Current analytics settings.
	 */
	$snippet = apply_filters('trydo_wp_theme_bolierplate_analytics_snippet', $snippet, $settings);

	if ('' === trim($snippet)) {
		return;
	}

	echo $snippet; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Trusted via sanitization.
}

/**
 * Outputs the analytics snippet in the document head when configured for it.
 */
function trydo_wp_theme_bolierplate_maybe_render_analytics_in_head(): void
{
	$settings = trydo_wp_theme_bolierplate_get_analytics_settings();

	if ('' !== trim($settings['head_snippet'])) {
		do_action('trydo_wp_theme_bolierplate_analytics', 'head', $settings);
	}
}

/**
 * Outputs the analytics snippet in the footer when configured for it.
 */
function trydo_wp_theme_bolierplate_maybe_render_analytics_in_footer(): void
{
	$settings = trydo_wp_theme_bolierplate_get_analytics_settings();

	if ('' !== trim($settings['footer_snippet'])) {
		do_action('trydo_wp_theme_bolierplate_analytics', 'footer', $settings);
	}
}

/**
 * Retrieves the snippet for the given context.
 *
 * @param string $context Either 'head' or 'footer'.
 * @param array $settings Current analytics settings.
 */
function trydo_wp_theme_bolierplate_get_snippet_by_context($context, array $settings): string
{
	if ('footer' === $context) {
		return $settings['footer_snippet'] ?? '';
	}

	return $settings['head_snippet'] ?? '';
}

/**
 * Helper to expose the current environment type.
 */
function trydo_wp_theme_bolierplate_current_environment(): string
{
	if (function_exists('wp_get_environment_type')) {
		return wp_get_environment_type();
	}

	if (defined('WP_ENV')) {
		return WP_ENV;
	}

	if (defined('WP_ENVIRONMENT_TYPE')) {
		return WP_ENVIRONMENT_TYPE;
	}

	return 'production';
}

trydo_wp_theme_bolierplate_register_analytics_module();
