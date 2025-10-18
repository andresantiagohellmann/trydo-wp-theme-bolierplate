# Trydo WP Theme Boilerplate

Modern WordPress FSE (Full Site Editing) theme boilerplate built with Vite, Tailwind CSS v4, and custom Gutenberg blocks.

## ✨ Features

- **⚡ Vite** - Lightning-fast HMR and optimized builds
- **🎨 Tailwind CSS v4** - Modern utility-first CSS framework with `@reference` directive
- **🧱 Custom Blocks** - Auto-discovery of Gutenberg blocks with JSX support
- **📦 Auto Block Category** - "Trydo Blocks" category for easy organization
- **🔍 Code Quality** - ESLint, Prettier, Stylelint with pre-commit hooks
- **🎯 TypeScript-ready** - Modern JavaScript with full ES modules support
- **♻️ Hot Module Replacement** - Instant updates in both editor and front-end
- **📝 EditorConfig** - Consistent code formatting across all editors
- **🎪 VSCode Integration** - Recommended extensions and settings included

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- WordPress 6.0+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📂 Project Structure

```
src/
├── blocks/               # Custom Gutenberg blocks
│   └── bolierplate-block/
│       ├── block.json    # Block metadata
│       ├── index.js      # Block registration
│       ├── edit.jsx      # Editor component (JSX)
│       ├── render.php    # Server-side rendering
│       ├── view.js       # Front-end JavaScript
│       ├── style.css     # Front-end styles
│       └── editor.css    # Editor-only styles
├── resources/
│   ├── scripts/          # Global JavaScript
│   │   ├── main.js       # Front-end entry
│   │   └── editor.js     # Editor entry
│   └── styles/           # Global CSS
│       ├── main.css      # Main Tailwind import
│       └── editor.css    # Editor styles
├── inc/                  # PHP modules
│   ├── assets.php        # Asset enqueuing
│   ├── blocks.php        # Block registration
│   ├── constants.php     # Theme constants
│   ├── editor.php        # Editor integration
│   └── vite.php          # Vite helpers
└── functions.php         # Theme bootstrap
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev               # Start Vite dev server with HMR
pnpm build             # Production build
pnpm preview           # Preview production build

# Code Quality
pnpm lint              # Run all linters (ESLint + Stylelint)
pnpm lint:js           # Lint JavaScript/JSX only
pnpm lint:css          # Lint CSS only
pnpm format            # Format all files with Prettier
pnpm format:check      # Check if files are formatted
```

## 🧱 Creating a New Block

1. Create a new directory under `src/blocks/`:

```bash
mkdir src/blocks/my-block
```

2. Create `block.json`:

```json
{
	"$schema": "https://schemas.wp.org/trunk/block.json",
	"apiVersion": 3,
	"name": "trydo-wp-theme-bolierplate/my-block",
	"title": "My Block",
	"category": "trydo-blocks",
	"icon": "smiley",
	"render": "file:./render.php"
}
```

3. Create `index.js`, `edit.jsx`, `render.php`, and optional CSS files.

The block will be **automatically discovered** and registered - no manual imports needed!

See `docs/development-journal.md` for detailed documentation.

## 🎨 CSS Architecture

This theme uses a specific CSS Cascade Layers strategy:

- **Block styles are placed OUTSIDE layers** for absolute priority
- `@reference` directive shares Tailwind config without reimporting
- Editor uses HMR-optimized CSS architecture

### Example Block CSS:

```css
@reference "../../resources/styles/main.css";

/* Styles OUTSIDE @layer have absolute priority */
.wp-block-trydo-wp-theme-bolierplate-my-block {
	@apply rounded-lg bg-white p-8;
}
```

## 🔧 Code Quality Tools

### Pre-commit Hooks

The project uses Husky + lint-staged to automatically:

- Fix ESLint errors
- Fix Stylelint errors
- Format code with Prettier
- **Auto-sort Tailwind CSS classes** in JSX, HTML, CSS, and PHP files

**Before every commit**, your code is automatically linted and formatted!

### Tailwind CSS Class Sorting

This project uses [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) to automatically sort Tailwind classes:

**Supported files:**

- ✅ **JSX/TSX** - Classes in `className` attributes
- ✅ **HTML** - Classes in `class` attributes
- ✅ **CSS** - Classes in `@apply` directives
- ⚠️ **PHP** - Classes in `class` attributes in HTML blocks (strings in PHP code are NOT sorted)

**Example:**

```jsx
// Before
<div className="p-4 mt-2 bg-blue-500 text-white rounded-lg">

// After (auto-sorted by Prettier)
<div className="mt-2 rounded-lg bg-blue-500 p-4 text-white">
```

### VSCode Setup

Install recommended extensions:

1. Open Command Palette (Cmd/Ctrl+Shift+P)
2. Type "Show Recommended Extensions"
3. Install all recommended extensions

Settings are automatically applied from `.vscode/settings.json`.

## 📖 Documentation

Comprehensive documentation is available in `docs/development-journal.md`:

- Theme architecture
- CSS Cascade Layers strategy
- Block development guide
- Troubleshooting common issues
- Decision log with rationale

## 🤝 Contributing

1. Make changes
2. Run `pnpm lint` to check for errors
3. Run `pnpm format` to format code
4. Commit (pre-commit hooks will run automatically)

## 📄 License

[Your License Here]

## 🙏 Credits

Built with:

- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [WordPress Block API](https://developer.wordpress.org/block-editor/)
