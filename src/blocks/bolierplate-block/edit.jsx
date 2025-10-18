const { __ } = wp.i18n;
const {
	useBlockProps,
	RichText,
	InspectorControls,
} = wp.blockEditor;
const { PanelBody, TextControl } = wp.components;

const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-bolierplate-block';

/**
 * Edit component for the Boilerplate Block.
 *
 * Uses the same Tailwind-powered classes as the frontend render to keep the
 * editor preview faithful to the final markup.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes
 * @param {Function} props.setAttributes
 */
export default function Edit( { attributes, setAttributes } ) {
	const { title, description, linkLabel, linkUrl } = attributes;

	const blockProps = useBlockProps( {
		className: BLOCK_CLASS,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Configurações do link', 'trydo-wp-theme-bolierplate' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'URL do botão', 'trydo-wp-theme-bolierplate' ) }
						value={ linkUrl }
						onChange={ ( value ) => setAttributes( { linkUrl: value } ) }
						placeholder="https://"
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<RichText
					tagName="h3"
					className={ `${ BLOCK_CLASS }__title` }
					value={ title }
					onChange={ ( value ) => setAttributes( { title: value } ) }
					placeholder={ __( 'Adicionar título…', 'trydo-wp-theme-bolierplate' ) }
					allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
				/>
				<RichText
					tagName="p"
					className={ `${ BLOCK_CLASS }__description` }
					value={ description }
					onChange={ ( value ) => setAttributes( { description: value } ) }
					placeholder={ __( 'Adicionar descrição…', 'trydo-wp-theme-bolierplate' ) }
				/>
				<div className={ `${ BLOCK_CLASS }__cta` }>
					<RichText
						tagName="span"
						className={ `${ BLOCK_CLASS }__button` }
						value={ linkLabel }
						onChange={ ( value ) => setAttributes( { linkLabel: value } ) }
						placeholder={ __( 'Texto do botão…', 'trydo-wp-theme-bolierplate' ) }
						allowedFormats={ [] }
					/>
				</div>
			</div>
		</>
	);
}
