const { __ } = wp.i18n;
const { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } = wp.blockEditor;
const { PanelBody, ToggleControl, TextControl, Button, BaseControl, RangeControl, SelectControl } =
	wp.components;
const { Fragment } = wp.element;

const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-nav-bar';

/**
 * Edit component for the Nav Bar block.
 */
export default function Edit({ attributes, setAttributes }) {
	const {
		logoId,
		logoUrl,
		logoAlt,
		logoHeightMobile,
		logoHeightSm,
		logoHeightMd,
		logoHeightLg,
		logoHeightXl,
		logoHeight2xl,
		menuItems,
		showLanguageToggle,
		showThemeToggle,
		showWhatsappButton,
		whatsappUrl,
		whatsappText,
		whatsappTarget,
		showInstagramButton,
		instagramUrl,
		instagramTarget,
		showEmailButton,
		emailUrl,
		emailTarget,
	} = attributes;

	// Build inline styles for logo heights
	const logoStyles = {
		'--logo-height-mobile': `${logoHeightMobile}px`,
		'--logo-height-sm': `${logoHeightSm}px`,
		'--logo-height-md': `${logoHeightMd}px`,
		'--logo-height-lg': `${logoHeightLg}px`,
		'--logo-height-xl': `${logoHeightXl}px`,
		'--logo-height-2xl': `${logoHeight2xl}px`,
	};

	const blockProps = useBlockProps({
		className: BLOCK_CLASS,
		style: logoStyles,
	});

	const onSelectLogo = (media) => {
		setAttributes({
			logoId: media.id,
			logoUrl: media.url,
			logoAlt: media.alt || 'Logo',
		});
	};

	const removeLogo = () => {
		setAttributes({
			logoId: 0,
			logoUrl: '',
			logoAlt: 'Logo',
		});
	};

	const updateMenuItem = (index, field, value) => {
		const newMenuItems = [...menuItems];
		newMenuItems[index] = { ...newMenuItems[index], [field]: value };
		setAttributes({ menuItems: newMenuItems });
	};

	const addMenuItem = () => {
		setAttributes({
			menuItems: [
				...menuItems,
				{
					label: 'Novo Item',
					isBold: false,
					url: '',
					linkType: 'internal',
					openInNewTab: false,
				},
			],
		});
	};

	const removeMenuItem = (index) => {
		const newMenuItems = menuItems.filter((_, i) => i !== index);
		setAttributes({ menuItems: newMenuItems });
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Logo', 'trydo-wp-theme-bolierplate')} initialOpen={true}>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={onSelectLogo}
							allowedTypes={['image']}
							value={logoId}
							render={({ open }) => (
								<BaseControl label={__('Logo Image', 'trydo-wp-theme-bolierplate')}>
									{logoUrl ? (
										<div>
											<img
												src={logoUrl}
												alt={logoAlt}
												style={{ maxWidth: '100%' }}
											/>
											<Button
												onClick={open}
												variant="secondary"
												style={{ marginTop: '10px' }}
											>
												{__('Change Logo', 'trydo-wp-theme-bolierplate')}
											</Button>
											<Button
												onClick={removeLogo}
												variant="link"
												isDestructive
												style={{ marginLeft: '10px' }}
											>
												{__('Remove Logo', 'trydo-wp-theme-bolierplate')}
											</Button>
										</div>
									) : (
										<Button onClick={open} variant="primary">
											{__('Upload Logo', 'trydo-wp-theme-bolierplate')}
										</Button>
									)}
								</BaseControl>
							)}
						/>
					</MediaUploadCheck>
					<TextControl
						label={__('Logo Alt Text', 'trydo-wp-theme-bolierplate')}
						value={logoAlt}
						onChange={(value) => setAttributes({ logoAlt: value })}
					/>

					<div
						style={{
							marginTop: '20px',
							paddingTop: '20px',
							borderTop: '1px solid #ddd',
						}}
					>
						<h3 style={{ marginBottom: '15px', fontSize: '13px', fontWeight: '600' }}>
							{__('Logo Height (Responsive)', 'trydo-wp-theme-bolierplate')}
						</h3>
						<RangeControl
							label={__('Mobile (< 640px)', 'trydo-wp-theme-bolierplate')}
							value={logoHeightMobile}
							onChange={(value) => setAttributes({ logoHeightMobile: value })}
							min={16}
							max={48}
							step={1}
							help={__(`Height: ${logoHeightMobile}px`, 'trydo-wp-theme-bolierplate')}
						/>
						<RangeControl
							label={__('Small (≥ 640px)', 'trydo-wp-theme-bolierplate')}
							value={logoHeightSm}
							onChange={(value) => setAttributes({ logoHeightSm: value })}
							min={16}
							max={48}
							step={1}
							help={__(`Height: ${logoHeightSm}px`, 'trydo-wp-theme-bolierplate')}
						/>
						<RangeControl
							label={__('Medium (≥ 768px)', 'trydo-wp-theme-bolierplate')}
							value={logoHeightMd}
							onChange={(value) => setAttributes({ logoHeightMd: value })}
							min={16}
							max={48}
							step={1}
							help={__(`Height: ${logoHeightMd}px`, 'trydo-wp-theme-bolierplate')}
						/>
						<RangeControl
							label={__('Large (≥ 1024px)', 'trydo-wp-theme-bolierplate')}
							value={logoHeightLg}
							onChange={(value) => setAttributes({ logoHeightLg: value })}
							min={16}
							max={48}
							step={1}
							help={__(`Height: ${logoHeightLg}px`, 'trydo-wp-theme-bolierplate')}
						/>
						<RangeControl
							label={__('Extra Large (≥ 1280px)', 'trydo-wp-theme-bolierplate')}
							value={logoHeightXl}
							onChange={(value) => setAttributes({ logoHeightXl: value })}
							min={16}
							max={48}
							step={1}
							help={__(`Height: ${logoHeightXl}px`, 'trydo-wp-theme-bolierplate')}
						/>
						<RangeControl
							label={__('2X Large (≥ 1536px)', 'trydo-wp-theme-bolierplate')}
							value={logoHeight2xl}
							onChange={(value) => setAttributes({ logoHeight2xl: value })}
							min={16}
							max={48}
							step={1}
							help={__(`Height: ${logoHeight2xl}px`, 'trydo-wp-theme-bolierplate')}
						/>
					</div>
				</PanelBody>

				<PanelBody
					title={__('Menu Items', 'trydo-wp-theme-bolierplate')}
					initialOpen={false}
				>
					{menuItems.map((item, index) => (
						<div
							key={index}
							style={{
								marginBottom: '15px',
								paddingBottom: '15px',
								borderBottom: '1px solid #ddd',
							}}
						>
							<TextControl
								label={__(`Item ${index + 1} Label`, 'trydo-wp-theme-bolierplate')}
								value={item.label}
								onChange={(value) => updateMenuItem(index, 'label', value)}
							/>
							<ToggleControl
								label={__('Bold', 'trydo-wp-theme-bolierplate')}
								checked={item.isBold}
								onChange={(value) => updateMenuItem(index, 'isBold', value)}
							/>
							<SelectControl
								label={__('Link Type', 'trydo-wp-theme-bolierplate')}
								value={item.linkType || 'internal'}
								options={[
									{
										label: __('WordPress Page', 'trydo-wp-theme-bolierplate'),
										value: 'internal',
									},
									{
										label: __('External URL', 'trydo-wp-theme-bolierplate'),
										value: 'external',
									},
								]}
								onChange={(value) => updateMenuItem(index, 'linkType', value)}
							/>
							<TextControl
								label={__('URL', 'trydo-wp-theme-bolierplate')}
								value={item.url || ''}
								onChange={(value) => updateMenuItem(index, 'url', value)}
								type="url"
								help={
									item.linkType === 'internal'
										? __(
												'Ex: /sobre, /servicos, /',
												'trydo-wp-theme-bolierplate'
											)
										: __(
												'Ex: https://exemplo.com',
												'trydo-wp-theme-bolierplate'
											)
								}
							/>
							<ToggleControl
								label={__('Open in New Tab', 'trydo-wp-theme-bolierplate')}
								checked={item.openInNewTab || false}
								onChange={(value) => updateMenuItem(index, 'openInNewTab', value)}
							/>
							<Button
								onClick={() => removeMenuItem(index)}
								variant="link"
								isDestructive
							>
								{__('Remove Item', 'trydo-wp-theme-bolierplate')}
							</Button>
						</div>
					))}
					<Button onClick={addMenuItem} variant="secondary">
						{__('Add Menu Item', 'trydo-wp-theme-bolierplate')}
					</Button>
				</PanelBody>

				<PanelBody
					title={__('Display Options', 'trydo-wp-theme-bolierplate')}
					initialOpen={false}
				>
					<ToggleControl
						label={__('Show Language Toggle', 'trydo-wp-theme-bolierplate')}
						checked={showLanguageToggle}
						onChange={(value) => setAttributes({ showLanguageToggle: value })}
					/>
					<ToggleControl
						label={__('Show Theme Toggle', 'trydo-wp-theme-bolierplate')}
						checked={showThemeToggle}
						onChange={(value) => setAttributes({ showThemeToggle: value })}
					/>
				</PanelBody>

				<PanelBody
					title={__('WhatsApp Button', 'trydo-wp-theme-bolierplate')}
					initialOpen={false}
				>
					<ToggleControl
						label={__('Show WhatsApp Button', 'trydo-wp-theme-bolierplate')}
						checked={showWhatsappButton}
						onChange={(value) => setAttributes({ showWhatsappButton: value })}
					/>
					{showWhatsappButton && (
						<>
							<TextControl
								label={__('WhatsApp URL', 'trydo-wp-theme-bolierplate')}
								value={whatsappUrl}
								onChange={(value) => setAttributes({ whatsappUrl: value })}
								type="url"
							/>
							<TextControl
								label={__('WhatsApp Text', 'trydo-wp-theme-bolierplate')}
								value={whatsappText}
								onChange={(value) => setAttributes({ whatsappText: value })}
							/>
							<ToggleControl
								label={__('Open in New Tab', 'trydo-wp-theme-bolierplate')}
								checked={whatsappTarget}
								onChange={(value) => setAttributes({ whatsappTarget: value })}
							/>
						</>
					)}
				</PanelBody>

				<PanelBody
					title={__('Instagram Button', 'trydo-wp-theme-bolierplate')}
					initialOpen={false}
				>
					<ToggleControl
						label={__('Show Instagram Button', 'trydo-wp-theme-bolierplate')}
						checked={showInstagramButton}
						onChange={(value) => setAttributes({ showInstagramButton: value })}
					/>
					{showInstagramButton && (
						<>
							<TextControl
								label={__('Instagram URL', 'trydo-wp-theme-bolierplate')}
								value={instagramUrl}
								onChange={(value) => setAttributes({ instagramUrl: value })}
								type="url"
							/>
							<ToggleControl
								label={__('Open in New Tab', 'trydo-wp-theme-bolierplate')}
								checked={instagramTarget}
								onChange={(value) => setAttributes({ instagramTarget: value })}
							/>
						</>
					)}
				</PanelBody>

				<PanelBody
					title={__('Email Button', 'trydo-wp-theme-bolierplate')}
					initialOpen={false}
				>
					<ToggleControl
						label={__('Show Email Button', 'trydo-wp-theme-bolierplate')}
						checked={showEmailButton}
						onChange={(value) => setAttributes({ showEmailButton: value })}
					/>
					{showEmailButton && (
						<>
							<TextControl
								label={__('Email URL', 'trydo-wp-theme-bolierplate')}
								value={emailUrl}
								onChange={(value) => setAttributes({ emailUrl: value })}
								type="url"
								help={__(
									'Use mailto:email@example.com format',
									'trydo-wp-theme-bolierplate'
								)}
							/>
							<ToggleControl
								label={__('Open in New Tab', 'trydo-wp-theme-bolierplate')}
								checked={emailTarget}
								onChange={(value) => setAttributes({ emailTarget: value })}
							/>
						</>
					)}
				</PanelBody>
			</InspectorControls>

			<header {...blockProps} data-nav-bar="wrapper">
				<div className={`${BLOCK_CLASS}__the-container main-px`}>
					<div className={`${BLOCK_CLASS}__brand`}>
						{logoUrl ? (
							<img
								className={`${BLOCK_CLASS}__brand-image`}
								src={logoUrl}
								alt={logoAlt}
							/>
						) : (
							'logo'
						)}
					</div>
					<nav className={`${BLOCK_CLASS}__nav`}>
						<div className={`${BLOCK_CLASS}__nav-buttons`}>
							{showWhatsappButton && whatsappUrl && (
								<a
									className={`${BLOCK_CLASS}__nav-whatsapp-mobile`}
									href={whatsappUrl}
									{...(whatsappTarget && {
										target: '_blank',
										rel: 'noopener noreferrer',
									})}
								>
									<div className={`${BLOCK_CLASS}__nav-whatsapp-mobile-icon`}>
										<i className="ph-fill ph-whatsapp-logo"></i>
									</div>
								</a>
							)}

							<button
								className={`${BLOCK_CLASS}__nav-button`}
								data-nav-bar="nav-button"
								aria-label="Toggle navigation menu"
							>
								<svg
									width="17"
									height="8"
									viewBox="0 0 17 8"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<rect
										width="17"
										height="2"
										rx="1"
										fill="black"
										data-nav-bar="nav-button-top"
									/>
									<rect
										y="6"
										width="17"
										height="2"
										rx="1"
										fill="black"
										data-nav-bar="nav-button-top"
									/>
								</svg>
							</button>
						</div>
						<div
							className={`${BLOCK_CLASS}__nav-container`}
							data-nav-bar="nav-container"
						>
							<div
								className={`${BLOCK_CLASS}__nav-content`}
								data-nav-bar="nav-content"
							>
								<ul className={`${BLOCK_CLASS}__menu`}>
									{menuItems.map((item, index) => (
										<li
											key={index}
											className={`${BLOCK_CLASS}__menu-item ${item.isBold ? `${BLOCK_CLASS}__menu-item--bold` : ''}`}
										>
											{item.label}
										</li>
									))}
								</ul>
								<div className={`${BLOCK_CLASS}__nav-tools`}>
									{showLanguageToggle && (
										<ul className={`${BLOCK_CLASS}__i18n`}>
											<li className={`${BLOCK_CLASS}__i18n-item--active`}>
												PT
											</li>
											<li className={`${BLOCK_CLASS}__i18n-item`}>EN</li>
										</ul>
									)}
									{showThemeToggle && (
										<ul className={`${BLOCK_CLASS}__theme-toggle`}>
											<li className={`${BLOCK_CLASS}__theme-toggle-item`}>
												<button
													className={`${BLOCK_CLASS}__theme-toggle-button`}
												>
													<i className="ph ph-sun-dim"></i>
												</button>
											</li>
											<li
												className={`${BLOCK_CLASS}__theme-toggle-item hidden`}
											>
												<button
													className={`${BLOCK_CLASS}__theme-toggle-button`}
												>
													<i className="ph ph-moon-stars"></i>
												</button>
											</li>
										</ul>
									)}
								</div>
								<div className={`${BLOCK_CLASS}__nav-contact`}>
									{showInstagramButton && instagramUrl && (
										<a
											className={`${BLOCK_CLASS}__nav-contact-link`}
											href={instagramUrl}
											{...(instagramTarget && {
												target: '_blank',
												rel: 'noopener noreferrer',
											})}
										>
											<i className="ph ph-instagram-logo"></i>
										</a>
									)}
									{showEmailButton && emailUrl && (
										<a
											className={`${BLOCK_CLASS}__nav-contact-link`}
											href={emailUrl}
											{...(emailTarget && {
												target: '_blank',
												rel: 'noopener noreferrer',
											})}
										>
											<i className="ph ph-envelope-simple"></i>
										</a>
									)}

									{showWhatsappButton && whatsappUrl && (
										<a
											className={`${BLOCK_CLASS}__nav-whatsapp`}
											href={whatsappUrl}
											{...(whatsappTarget && {
												target: '_blank',
												rel: 'noopener noreferrer',
											})}
										>
											<span className={`${BLOCK_CLASS}__whatsapp-text`}>
												{whatsappText}
											</span>
											<div className={`${BLOCK_CLASS}__whatsapp-icon`}>
												<i className="ph-fill ph-whatsapp-logo"></i>
											</div>
										</a>
									)}
								</div>
							</div>
						</div>
					</nav>
				</div>
			</header>
		</Fragment>
	);
}
