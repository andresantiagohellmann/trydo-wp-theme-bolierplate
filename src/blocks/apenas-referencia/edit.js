const { createElement, Fragment } = wp.element;
const { __ } = wp.i18n;
const {
	useBlockProps,
	RichText,
	InspectorControls,
} = wp.blockEditor;
const { PanelBody, TextControl } = wp.components;

const BLOCK_CLASS = 'wp-block-teste-apenas-referencia';

/**
 * Edit component for the Apenas Referência block.
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

	return createElement(
		Fragment,
		null,
		createElement(
			InspectorControls,
			null,
			createElement(
				PanelBody,
				{
					title: __( 'Configurações do link', 'teste' ),
					initialOpen: true,
				},
				createElement( TextControl, {
					label: __( 'URL do botão', 'teste' ),
					value: linkUrl,
					onChange: ( value ) => setAttributes( { linkUrl: value } ),
					placeholder: 'https://',
				} )
			)
		),
		createElement(
			'div',
			blockProps,
			createElement( RichText, {
				tagName: 'h3',
				className: `${ BLOCK_CLASS }__title`,
				value: title,
				onChange: ( value ) => setAttributes( { title: value } ),
				placeholder: __( 'Adicionar título…', 'teste' ),
				allowedFormats: [ 'core/bold', 'core/italic', 'core/link' ],
			} ),
			createElement( RichText, {
				tagName: 'p',
				className: `${ BLOCK_CLASS }__description`,
				value: description,
				onChange: ( value ) => setAttributes( { description: value } ),
				placeholder: __( 'Adicionar descrição…', 'teste' ),
			} ),
			createElement(
				'div',
				{
					className: `${ BLOCK_CLASS }__cta`,
				},
				createElement( RichText, {
					tagName: 'span',
					className: `${ BLOCK_CLASS }__button`,
					value: linkLabel,
					onChange: ( value ) => setAttributes( { linkLabel: value } ),
					placeholder: __( 'Texto do botão…', 'teste' ),
					allowedFormats: [],
				} )
			)
		)
	);
}
