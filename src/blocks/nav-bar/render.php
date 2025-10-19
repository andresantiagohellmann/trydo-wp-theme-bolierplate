<?php
/**
 * Server-side render for the Nav Bar block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 *
 * @return string
 */

$wrapper_attributes = get_block_wrapper_attributes([
	'class' => 'wp-block-trydo-wp-theme-bolierplate-nav-bar',
]);

$site_logo_markup = get_custom_logo();

if (empty($site_logo_markup)) {
	$site_logo_markup = sprintf(
		'<a class="custom-logo-link" href="%1$s">%2$s</a>',
		esc_url(home_url('/')),
		esc_html(get_bloginfo('name')),
	);
}

ob_start();
?>
<header <?php echo $wrapper_attributes; ?>>
	<div class="nav-bar__logo">
		<?php echo $site_logo_markup; ?>
	</div>
	<div class="nav-bar__menu">menu</div>
</header>
<?php return ob_get_clean();
