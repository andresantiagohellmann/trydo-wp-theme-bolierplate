import metadata from './block.json';
import Edit from './edit.jsx';
import './editor.css';

const { registerBlockType } = wp.blocks;

const { name, render, ...settings } = metadata;

registerBlockType( name, {
	...settings,
	edit: Edit,
	save: () => null,
} );
