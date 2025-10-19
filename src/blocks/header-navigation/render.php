<?php
/**
 * Server-side render for the Header Navigation block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content (unused).
 * @param WP_Block $block      Block instance.
 *
 * @return string
 */

$defaults = [
	'align' => 'full',
	'logoText' => 'Trydo',
	'logoUrl' => '/',
	'ctaLabel' => 'Fale conosco',
	'ctaUrl' => '#',
	'menuItems' => [],
];

$attributes = wp_parse_args($attributes, $defaults);

$logo_text = $attributes['logoText'] ?? '';
$logo_url = $attributes['logoUrl'] ?? '#';
$cta_label = $attributes['ctaLabel'] ?? '';
$cta_url = $attributes['ctaUrl'] ?? '#';
$align = $attributes['align'] ?? '';

$menu_items = array_filter(
	is_array($attributes['menuItems']) ? $attributes['menuItems'] : [],
	static function ($item) {
		return is_array($item) && !empty($item['label']);
	},
);

$menu_items = array_map(static function ($item) {
	return [
		'label' => wp_kses_post($item['label']),
		'url' => isset($item['url']) ? esc_url_raw($item['url']) : '#',
	];
}, $menu_items);

$align_class = in_array($align, ['wide', 'full'], true) ? " align{$align}" : '';
$block_class = 'wp-block-trydo-wp-theme-bolierplate-header-navigation';
$menu_id = wp_unique_id("{$block_class}__menu_");

$wrapper_attributes = get_block_wrapper_attributes([
	'class' => trim("{$block_class}{$align_class}"),
	'aria-label' => __('Navegação principal', 'trydo-wp-theme-bolierplate'),
]);

ob_start();
?>
<nav <?php echo $wrapper_attributes; ?>>
	<div class="<?php echo esc_attr("{$block_class}__inner"); ?>">
		<a class="<?php echo esc_attr("{$block_class}__logo"); ?>"
			href="<?php echo esc_url($logo_url ?: '#'); ?>"
		>
			<span class="<?php echo esc_attr("{$block_class}__logo-text"); ?>">
				<?php echo esc_html($logo_text); ?>
			</span>
		</a>

		<button
			class="<?php echo esc_attr("{$block_class}__toggle"); ?>"
			type="button"
			aria-expanded="false"
			aria-controls="<?php echo esc_attr($menu_id); ?>"
		>
			<span class="screen-reader-text">
				<?php esc_html_e('Abrir menu de navegação', 'trydo-wp-theme-bolierplate'); ?>
			</span>
			<span aria-hidden="true" class="<?php echo esc_attr("{$block_class}__toggle-bar"); ?>"></span>
			<span aria-hidden="true" class="<?php echo esc_attr("{$block_class}__toggle-bar"); ?>"></span>
			<span aria-hidden="true" class="<?php echo esc_attr("{$block_class}__toggle-bar"); ?>"></span>
		</button>

		<div
			class="<?php echo esc_attr("{$block_class}__collapsible"); ?>"
			data-state="closed"
			id="<?php echo esc_attr($menu_id); ?>"
		>
			<?php if (!empty($menu_items)): ?>
				<ul class="<?php echo esc_attr("{$block_class}__menu"); ?>">
					<?php foreach ($menu_items as $item): ?>
						<li class="<?php echo esc_attr("{$block_class}__menu-item"); ?>">
							<a
								class="<?php echo esc_attr("{$block_class}__menu-link"); ?>"
								href="<?php echo esc_url($item['url'] ?: '#'); ?>"
							>
								<span><?php echo esc_html(wp_strip_all_tags($item['label'])); ?></span>
							</a>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>

			<?php if ($cta_label): ?>
				<a class="<?php echo esc_attr("{$block_class}__cta"); ?>" href="<?php echo esc_url(
	$cta_url ?: '#',
); ?>">
					<span class="<?php echo esc_attr("{$block_class}__cta-label"); ?>">
						<?php echo esc_html($cta_label); ?>
					</span>
				</a>
			<?php endif; ?>
		</div>
	</div>
</nav>
<?php return ob_get_clean();
