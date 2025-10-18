<?php
/**
 * Server-side render for the Boilerplate Block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content (unused because it is dynamic).
 * @param WP_Block $block      Block instance.
 *
 * @return string
 */

$title       = $attributes['title'] ?? '';
$description = $attributes['description'] ?? '';
$link_label  = $attributes['linkLabel'] ?? '';
$link_url    = $attributes['linkUrl'] ?? '#';

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wp-block-trydo-wp-theme-bolierplate-bolierplate-block',
	)
);

ob_start();
?>
<div <?php echo $wrapper_attributes; ?>>
	<?php if ( $title ) : ?>
		<h3 class="wp-block-trydo-wp-theme-bolierplate-bolierplate-block__title">
			<?php echo esc_html( $title ); ?>
		</h3>
	<?php endif; ?>

	<?php if ( $description ) : ?>
		<p class="wp-block-trydo-wp-theme-bolierplate-bolierplate-block__description">
			<?php echo wp_kses_post( $description ); ?>
		</p>
	<?php endif; ?>

	<?php if ( $link_label ) : ?>
		<a
			class="wp-block-trydo-wp-theme-bolierplate-bolierplate-block__button"
			href="<?php echo esc_url( $link_url ?: '#' ); ?>"
		>
			<?php echo esc_html( $link_label ); ?>
		</a>
	<?php endif; ?>
</div>
<?php

return ob_get_clean();
