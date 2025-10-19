const { __ } = wp.i18n;
const { useBlockProps } = wp.blockEditor;

const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-nav-bar';

/**
 * Edit component for the Nav Bar block.
 */
export default function Edit() {
	const blockProps = useBlockProps({
		className: BLOCK_CLASS,
	});

	return (
		<div {...blockProps}>
			<div className="nav-bar__logo">
				<p>{__('Logo', 'trydo-wp-theme-bolierplate')}</p>
			</div>
			<div className="nav-bar__menu text-right">
				<p>{__('menu', 'trydo-wp-theme-bolierplate')}</p>
			</div>
		</div>
	);
}
