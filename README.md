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
│   │   ├── editor.js     # Editor entry
│   │   └── vendors.js    # External libraries (GSAP, etc.)
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

## 📦 External Libraries (Vendors Bundle)

This theme uses a **vendors bundle** system to manage external libraries like GSAP, preventing code duplication across blocks.

### Adding a New Library

**1. Install via pnpm:**

```bash
pnpm add gsap
# or any other library
pnpm add embla-carousel
```

**2. Import in `src/resources/scripts/vendors.js`:**

```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

window.ThemeVendors = {
	gsap,
	ScrollTrigger,
};

export { gsap, ScrollTrigger };
```

**3. Use in your blocks:**

```javascript
// src/blocks/my-block/interactive.js or view.js
(function () {
	'use strict';

	const { gsap } = window.ThemeVendors || {};

	if (!gsap) {
		console.warn('GSAP not available. Vendors bundle may not be loaded.');
		return;
	}

	document.addEventListener('DOMContentLoaded', () => {
		gsap.to('.my-element', {
			opacity: 1,
			duration: 1,
		});
	});
})();
```

### Benefits

- ✅ **Zero duplication** - Libraries loaded once, shared across all blocks
- ✅ **Simple workflow** - Just `pnpm add` and import in vendors.js
- ✅ **Performance** - Browser caches vendors bundle separately
- ✅ **Auto dependency injection** - Vendors bundle automatically loaded before block scripts
- ✅ **Full HMR support** - Hot reload works for all block scripts in development

### Currently Included

- **GSAP** - Animation library with ScrollTrigger plugin

See the boilerplate block for a working example with GSAP animations!

## ⚡ Hot Module Replacement (HMR)

This theme includes **full HMR support** for all file types:

### What Gets Hot Reloaded

- ✅ **Block JSX components** (`edit.jsx`) - Instant updates in editor
- ✅ **Block styles** (`style.css`, `editor.css`) - Real-time CSS changes
- ✅ **Block scripts** (`interactive.js`, `view.js`) - Full page reload on change
- ✅ **PHP templates** (`render.php`, etc.) - Full page reload on change
- ✅ **Vendors bundle** (`vendors.js`) - Full page reload on change

### Block Scripts HMR

The theme includes a custom Vite plugin that watches `interactive.js` and `view.js` files:

```javascript
// vite.config.js includes watchBlockScriptsPlugin()
// Automatically reloads page when block scripts change
```

**How it works:**

1. Edit any `src/blocks/*/interactive.js` or `view.js` file
2. Vite detects the change and triggers a full page reload
3. See changes instantly in both editor and frontend
4. Console log shows: `[HMR] Block script changed: your-block/interactive.js`

### Best Practices

- **Use IIFE** to avoid global scope pollution:
    ```javascript
    (function () {
    	'use strict';
    	// Your code here
    })();
    ```
- **Check for dependencies** before using them:
    ```javascript
    const { gsap } = window.ThemeVendors || {};
    if (!gsap) return;
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

## 🎨 Customizing Colors and Fonts

### Changing Colors

Colors are centralized in `src/resources/styles/custom/colors.css` using **OKLCH** color space.

**To change a color:**

1. Open `src/resources/styles/custom/colors.css`
2. Edit the OKLCH values (format: `oklch(lightness% chroma hue)`)
3. Update the corresponding value in `src/theme.json` (for WordPress editor support)

**Example - Changing primary color:**

```css
/* colors.css */
--color-primary-regular: oklch(65% 0.15 250); /* Blue */
/* Change to purple: */
--color-primary-regular: oklch(65% 0.15 300);
```

```json
/* theme.json */
{
	"slug": "primary-regular",
	"color": "oklch(65% 0.15 300)",
	"name": "Primary"
}
```

**OKLCH Parameters:**

- **Lightness**: 0-100% (0% = black, 100% = white)
- **Chroma**: 0-0.4 (saturation intensity)
- **Hue**: 0-360 (color wheel angle)

**Tool:** Use [oklch.com](https://oklch.com) to pick colors visually

### Changing Fonts

Fonts are configured in `src/resources/styles/custom/fonts.css` and `typography.css`.

**To add/change fonts:**

1. **Download font files** (`.woff2` format recommended)
    - Use [google-webfonts-helper](https://gwfh.mranftl.com/) for Google Fonts

2. **Place files in** `src/resources/fonts/`

3. **Add `@font-face` declaration** in `src/resources/styles/custom/fonts.css`:

```css
@font-face {
	font-family: 'Your Font Name';
	src: url('../../fonts/YourFont-Variable.woff2') format('woff2');
	font-weight: 300 700;
	font-style: normal;
	font-display: swap;
}
```

4. **Update Tailwind config** in `src/resources/styles/custom/typography.css`:

```css
@theme {
	--font-sans: 'Your Font Name', ui-sans-serif, system-ui, sans-serif;
}
```

5. **Update WordPress config** in `src/theme.json`:

```json
{
	"fontFamily": "'Your Font Name', ui-sans-serif, system-ui, sans-serif",
	"name": "Your Font Name",
	"slug": "body"
}
```

6. **Build** to apply changes: `pnpm build`

### Color Palette Structure

The theme includes **27 colors** organized in 5 categories:

- **Neutrals**: `light`, `dark`
- **Primary** (Blue): `thin`, `light`, `regular`, `medium`, `bold`
- **Secondary** (Orange): `thin`, `light`, `regular`, `medium`, `bold`
- **Tertiary** (Yellow): `thin`, `light`, `regular`, `medium`, `bold`
- **Success** (Green): `thin`, `light`, `regular`, `medium`, `bold`
- **Error** (Red): `thin`, `light`, `regular`, `medium`, `bold`

All colors are synchronized between Tailwind CSS and WordPress `theme.json`.

## 📊 Analytics Snippets

- Acesse **Aparência → Analytics** para colar snippets de rastreamento sem plugins externos.
- Há campos separados para o cabeçalho (`wp_head`) e para o rodapé (`wp_footer`); cole os trechos conforme a instrução do provedor (Gtag, Meta Pixel, Matomo, etc.).
- Por padrão, os códigos só carregam quando o ambiente é produção (`wp_get_environment_type()`), mas você pode desmarcar a opção ou alterar via filtro `trydo_wp_theme_bolierplate_allow_analytics`.
- Use a action `do_action( 'trydo_wp_theme_bolierplate_analytics', 'head' | 'footer' )` para reinjetar os snippets manualmente após consentimento ou para extensões de privacidade.

## 📖 Documentation

Comprehensive documentation is available in `docs/development-journal.md`:

- Theme architecture
- CSS Cascade Layers strategy
- Block development guide
- Color palette and typography system
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
