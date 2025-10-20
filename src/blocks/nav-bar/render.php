<?php
/**
 * Server-side render for the Nav Bar block.
 *
 * @param array $attributes Block attributes.
 * @param string $content Block content.
 * @param WP_Block $block Block instance.
 *
 * @return string
 */

// Extract attributes with defaults
$logo_url = $attributes['logoUrl'] ?? '';
$logo_alt = $attributes['logoAlt'] ?? 'Logo';
$logo_height_mobile = $attributes['logoHeightMobile'] ?? 24;
$logo_height_sm = $attributes['logoHeightSm'] ?? 28;
$logo_height_md = $attributes['logoHeightMd'] ?? 32;
$logo_height_lg = $attributes['logoHeightLg'] ?? 36;
$logo_height_xl = $attributes['logoHeightXl'] ?? 40;
$logo_height_2xl = $attributes['logoHeight2xl'] ?? 48;
$menu_items = $attributes['menuItems'] ?? [];
$show_language = $attributes['showLanguageToggle'] ?? true;
$show_theme = $attributes['showThemeToggle'] ?? true;
$show_whatsapp = $attributes['showWhatsappButton'] ?? true;
$whatsapp_url = $attributes['whatsappUrl'] ?? '';
$whatsapp_text = $attributes['whatsappText'] ?? 'Diga olá';
$whatsapp_target = $attributes['whatsappTarget'] ?? true;
$show_instagram = $attributes['showInstagramButton'] ?? true;
$instagram_url = $attributes['instagramUrl'] ?? '';
$instagram_target = $attributes['instagramTarget'] ?? true;
$show_email = $attributes['showEmailButton'] ?? true;
$email_url = $attributes['emailUrl'] ?? '';
$email_target = $attributes['emailTarget'] ?? false;

// Build CSS custom properties for logo heights
$logo_styles = sprintf(
	'--logo-height-mobile: %dpx; --logo-height-sm: %dpx; --logo-height-md: %dpx; --logo-height-lg: %dpx; --logo-height-xl: %dpx; --logo-height-2xl: %dpx;',
	$logo_height_mobile,
	$logo_height_sm,
	$logo_height_md,
	$logo_height_lg,
	$logo_height_xl,
	$logo_height_2xl,
);

$wrapper_attributes = get_block_wrapper_attributes([
	'class' => 'wp-block-trydo-wp-theme-bolierplate-nav-bar',
	'style' => $logo_styles,
]);

ob_start();
?>
<header <?php echo $wrapper_attributes; ?> data-nav-bar="wrapper">
    <div class="wp-block-trydo-wp-theme-bolierplate-nav-bar__the-container main-px">
        <div class="wp-block-trydo-wp-theme-bolierplate-nav-bar__brand">
            <?php if ($logo_url): ?>
            <img class="wp-block-trydo-wp-theme-bolierplate-nav-bar__brand-image"
                src="<?php echo esc_url($logo_url); ?>" alt="<?php echo esc_attr($logo_alt); ?>" />
            <?php else: ?>
            logo
            <?php endif; ?>
        </div>
        <nav class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav">
            <div class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-buttons">
                <?php if ($show_whatsapp && $whatsapp_url): ?>
                <a class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-whatsapp-mobile"
                    href="<?php echo esc_url($whatsapp_url); ?>" <?php echo $whatsapp_target
	? 'target="_blank" rel="noopener noreferrer"'
	: ''; ?>>
                    <div class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-whatsapp-mobile-icon">
                        <i class="ph-fill ph-whatsapp-logo"></i>
                    </div>
                </a>
                <?php endif; ?>

                <button class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-button" data-nav-bar="nav-button"
                    aria-label="Toggle navigation menu">
                    <svg width="17" height="8" viewBox="0 0 17 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="17" height="2" rx="1" fill="currentColor" data-nav-bar="nav-button-top" />
                        <rect y="6" width="17" height="2" rx="1" fill="currentColor" data-nav-bar="nav-button-top" />
                    </svg>
                </button>
            </div>
            <div class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-container" data-nav-bar="nav-container">
                <div class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-content" data-nav-bar="nav-content">
                    <ul class="wp-block-trydo-wp-theme-bolierplate-nav-bar__menu">
                        <?php foreach ($menu_items as $item): ?>
                        <li class="wp-block-trydo-wp-theme-bolierplate-nav-bar__menu-item <?php echo !empty(
                        	$item['isBold']
                        )
							? 'wp-block-trydo-wp-theme-bolierplate-nav-bar__menu-item--bold'
							: ''; ?>">
                            <?php if (!empty($item['url'])): ?>
                                <a href="<?php echo esc_url($item['url']); ?>" <?php echo !empty(
                                	$item['openInNewTab']
                                )
                        			? 'target="_blank" rel="noopener noreferrer"'
                        			: ''; ?>>
                                    <?php echo esc_html($item['label']); ?>
                                </a>
                            <?php else: ?>
                                <?php echo esc_html($item['label']); ?>
                            <?php endif; ?>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                    <div class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-tools">
                        <?php if ($show_language): ?>
                        <ul class="wp-block-trydo-wp-theme-bolierplate-nav-bar__i18n">
                            <li class="wp-block-trydo-wp-theme-bolierplate-nav-bar__i18n-item--active">
                                PT
                            </li>
                            <li class="wp-block-trydo-wp-theme-bolierplate-nav-bar__i18n-item">
                                EN
                            </li>
                        </ul>
                        <?php endif; ?>
                        <?php if ($show_theme): ?>
                        <ul class="wp-block-trydo-wp-theme-bolierplate-nav-bar__theme-toggle">
                            <li class="wp-block-trydo-wp-theme-bolierplate-nav-bar__theme-toggle-item">
                                <button class="wp-block-trydo-wp-theme-bolierplate-nav-bar__theme-toggle-button">
                                    <i class="ph ph-sun-dim"></i>
                                </button>
                            </li>
                            <li class="wp-block-trydo-wp-theme-bolierplate-nav-bar__theme-toggle-item hidden">
                                <button class="wp-block-trydo-wp-theme-bolierplate-nav-bar__theme-toggle-button">
                                    <i class="ph ph-moon-stars"></i>
                                </button>
                            </li>
                        </ul>
                        <?php endif; ?>
                    </div>
                    <div class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-contact">
                        <?php if ($show_instagram && $instagram_url): ?>
                        <a class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-contact-link"
                            href="<?php echo esc_url(
                            	$instagram_url,
                            ); ?>" <?php echo $instagram_target
	? 'target="_blank" rel="noopener noreferrer"'
	: ''; ?>>
                            <i class="ph ph-instagram-logo"></i>
                        </a>
                        <?php endif; ?>
                        <?php if ($show_email && $email_url): ?>
                        <a class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-contact-link"
                            href="<?php echo esc_url($email_url); ?>" <?php echo $email_target
	? 'target="_blank" rel="noopener noreferrer"'
	: ''; ?>>
                            <i class="ph ph-envelope-simple"></i>
                        </a>
                        <?php endif; ?>

                        <?php if ($show_whatsapp && $whatsapp_url): ?>
                        <a class="wp-block-trydo-wp-theme-bolierplate-nav-bar__nav-whatsapp"
                            href="<?php echo esc_url($whatsapp_url); ?>" <?php echo $whatsapp_target
	? 'target="_blank" rel="noopener noreferrer"'
	: ''; ?>>
                            <span class="wp-block-trydo-wp-theme-bolierplate-nav-bar__whatsapp-text">
                                <?php echo esc_html($whatsapp_text); ?>
                            </span>
                            <div class="wp-block-trydo-wp-theme-bolierplate-nav-bar__whatsapp-icon">
                                <i class="ph-fill ph-whatsapp-logo"></i>
                            </div>
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</header>
<?php return ob_get_clean();
