import metadata from './block.json';
import Edit from './edit.jsx';
import './style.css';

const { registerBlockType } = wp.blocks;

const { name, render: _render, ...settings } = metadata;

registerBlockType(name, {
	...settings,
	edit: Edit,
	save: () => null,
});
