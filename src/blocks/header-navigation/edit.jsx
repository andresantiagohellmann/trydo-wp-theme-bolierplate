const { __, sprintf } = wp.i18n;
const { useBlockProps, RichText, InspectorControls } = wp.blockEditor;
const { PanelBody, TextControl, Button } = wp.components;
const { Fragment } = wp.element;
const { useInstanceId } = wp.compose;

const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-header-navigation';

const MAX_MENU_ITEMS = 6;

/**
 * Safely update an item within the menu array.
 *
 * @param {Array}  items
 * @param {number} index
 * @param {Object} data
 * @return {Array}
 */
const updateMenuItems = (items, index, data) => {
	return items.map((item, current) => {
		if (current !== index) {
			return item;
		}

		return {
			...item,
			...data,
		};
	});
};

/**
 * Edit component for the Header Navigation block.
 *
 * Renders a responsive layout with logo, navigation links and CTA, mirroring the
 * markup generated on the server so that the editor stays faithful to the front-end.
 */
export default function Edit({ attributes, setAttributes }) {
	const { align, logoText, logoUrl, menuItems = [], ctaLabel, ctaUrl } = attributes;
	const instanceId = useInstanceId(Edit);

	const blockProps = useBlockProps({
		className: `${BLOCK_CLASS} ${align ? `align${align}` : ''}`,
	});

	const handleAddMenuItem = () => {
		if (menuItems.length >= MAX_MENU_ITEMS) {
			return;
		}

		const newItems = [
			...menuItems,
			{
				id: `item-${Date.now()}`,
				label: __('Novo item', 'trydo-wp-theme-bolierplate'),
				url: '#',
			},
		];

		setAttributes({ menuItems: newItems });
	};

	const handleRemoveMenuItem = (index) => {
		const filtered = menuItems.filter((_, current) => current !== index);
		setAttributes({ menuItems: filtered });
	};

	const handleMenuItemChange = (index, key, value) => {
		const updated = updateMenuItems(menuItems, index, { [key]: value });
		setAttributes({ menuItems: updated });
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__('Logo', 'trydo-wp-theme-bolierplate')} initialOpen={true}>
					<TextControl
						label={__('URL da logo', 'trydo-wp-theme-bolierplate')}
						value={logoUrl}
						onChange={(value) => setAttributes({ logoUrl: value })}
						placeholder="https://"
					/>
				</PanelBody>

				<PanelBody
					title={__('Itens do menu', 'trydo-wp-theme-bolierplate')}
					initialOpen={true}
				>
					{menuItems.length === 0 && (
						<p>
							{__(
								'Adicione links para compor a navegação principal.',
								'trydo-wp-theme-bolierplate'
							)}
						</p>
					)}

					{menuItems.map((item, index) => (
						<div
							className={`${BLOCK_CLASS}__menu-item-control`}
							key={item?.id ?? index}
						>
							<p className={`${BLOCK_CLASS}__menu-item-heading`}>
								{sprintf(__('Link %d', 'trydo-wp-theme-bolierplate'), index + 1)}
							</p>
							<TextControl
								label={__('Texto', 'trydo-wp-theme-bolierplate')}
								value={item?.label ?? ''}
								onChange={(value) => handleMenuItemChange(index, 'label', value)}
							/>
							<TextControl
								label={__('URL', 'trydo-wp-theme-bolierplate')}
								value={item?.url ?? ''}
								onChange={(value) => handleMenuItemChange(index, 'url', value)}
								placeholder="https://"
							/>
							<Button
								variant="secondary"
								isDestructive
								onClick={() => handleRemoveMenuItem(index)}
							>
								{__('Remover link', 'trydo-wp-theme-bolierplate')}
							</Button>
						</div>
					))}

					<Button
						variant="secondary"
						onClick={handleAddMenuItem}
						disabled={menuItems.length >= MAX_MENU_ITEMS}
					>
						{__('Adicionar link', 'trydo-wp-theme-bolierplate')}
					</Button>
				</PanelBody>

				<PanelBody title={__('CTA', 'trydo-wp-theme-bolierplate')} initialOpen={false}>
					<TextControl
						label={__('URL do CTA', 'trydo-wp-theme-bolierplate')}
						value={ctaUrl}
						onChange={(value) => setAttributes({ ctaUrl: value })}
						placeholder="https://"
					/>
				</PanelBody>
			</InspectorControls>

			<nav
				{...blockProps}
				aria-label={__('Navegação principal', 'trydo-wp-theme-bolierplate')}
			>
				<div className={`${BLOCK_CLASS}__inner`}>
					<a className={`${BLOCK_CLASS}__logo`} href={logoUrl || '#'}>
						<RichText
							tagName="span"
							className={`${BLOCK_CLASS}__logo-text`}
							value={logoText}
							onChange={(value) => setAttributes({ logoText: value })}
							placeholder={__('Nome da marca', 'trydo-wp-theme-bolierplate')}
							allowedFormats={['core/bold', 'core/italic']}
						/>
					</a>

					<button
						className={`${BLOCK_CLASS}__toggle`}
						type="button"
						aria-expanded="false"
						aria-controls={`${BLOCK_CLASS}__menu-${instanceId}`}
					>
						<span className="screen-reader-text">
							{__('Abrir menu de navegação', 'trydo-wp-theme-bolierplate')}
						</span>
						<span aria-hidden="true" className={`${BLOCK_CLASS}__toggle-bar`} />
						<span aria-hidden="true" className={`${BLOCK_CLASS}__toggle-bar`} />
						<span aria-hidden="true" className={`${BLOCK_CLASS}__toggle-bar`} />
					</button>

					<div
						className={`${BLOCK_CLASS}__collapsible`}
						data-state="closed"
						id={`${BLOCK_CLASS}__menu-${instanceId}`}
					>
						<ul className={`${BLOCK_CLASS}__menu`}>
							{menuItems.map((item, index) => (
								<li className={`${BLOCK_CLASS}__menu-item`} key={item?.id ?? index}>
									<RichText
										tagName="span"
										className={`${BLOCK_CLASS}__menu-link`}
										value={item?.label ?? ''}
										onChange={(value) =>
											handleMenuItemChange(index, 'label', value)
										}
										placeholder={__(
											'Texto do link',
											'trydo-wp-theme-bolierplate'
										)}
										allowedFormats={['core/bold', 'core/italic']}
									/>
								</li>
							))}
						</ul>

						<a className={`${BLOCK_CLASS}__cta`} href={ctaUrl || '#'}>
							<RichText
								tagName="span"
								className={`${BLOCK_CLASS}__cta-label`}
								value={ctaLabel}
								onChange={(value) => setAttributes({ ctaLabel: value })}
								placeholder={__('Texto do CTA', 'trydo-wp-theme-bolierplate')}
								allowedFormats={['core/bold', 'core/italic']}
							/>
						</a>
					</div>
				</div>
			</nav>
		</Fragment>
	);
}
