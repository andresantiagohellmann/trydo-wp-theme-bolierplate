# Trydo WP Theme Bolierplate – Development Journal

## Purpose
- Centralize the project’s architecture notes, decisions, and troubleshooting tips.
- Record the workflows that keep the Vite + WordPress integration healthy (theme + blocks).
- Capture what changed and why whenever we land a successful update (add an entry under **Decision Log** when committing).

## Theme Architecture
- **Bootstrap** (`src/functions.php`): Loads the modular helpers in `src/inc/` and wires them into WordPress via hooks.
- **Constants** (`src/inc/constants.php`): Stores the canonical entry points for the Vite build (theme, blocks, editor).
- **Vite helpers** (`src/inc/vite.php`): Resolves paths/URLs, reads the manifest, and talks to the dev server. All helper functions use the `trydo_wp_theme_bolierplate_` prefix.
- **Asset loading** (`src/inc/assets.php`): Enqueues JS/CSS for the front end and editor, handling both dev-server and built-manifest modes.
- **Editor integration** (`src/inc/editor.php`): Registers `editor-styles` support and loads the CSS emitted for editor contexts.
- **Blocks** (`src/inc/blocks.php`): Auto-registers block directories under `src/blocks` and attaches `render.php` as needed.

## Asset & Content Structure
- Global styles live in `src/resources/styles/` and scripts in `src/resources/scripts/`. `fonts/` and `images/` are reserved for static assets.
- The main entry (`main.js`) imports Tailwind and block styles; the editor entry keeps the block editor in sync.
- Block-specific assets sit in `src/blocks/<block-name>/` alongside their `block.json`, `edit.js`, `editor.css`, and `render.php`.
- The theme stylesheet header (`src/style.css`) is the authoritative source for theme metadata (name, text domain, etc.).

## Local Development Workflow
1. **Install dependencies:** `pnpm install`.
2. **Configure host/port (optional):** set `WP_VITE_HOST` and `WP_VITE_PORT` in your environment if you need something other than `127.0.0.1:5173`.
3. **Run dev server:** `pnpm dev`. The Vite helpers look for the dev server via `trydo_wp_theme_bolierplate_vite_dev_server_origin()`.
4. **Load the theme in WordPress:** With the dev server online, WordPress will enqueue the live bundle instead of the built manifest. If the site can’t reach the dev URL, WordPress falls back to the last build.
5. **Block development:** Any time you scaffold a new block under `src/blocks`, its `index.js` will be pulled into the build via `src/blocks/index.js`. Hot reloading works for both blocks and theme assets while the dev server is running.

### Troubleshooting Dev Mode
- **Dev server not detected:** Check the browser console for 404s to `@vite/client`. Confirm `pnpm dev` is running and that the host/port matches any reverse proxy or Docker network you’re using. Override with the `trydo_wp_theme_bolierplate_vite_dev_server_origin` filter or `WP_VITE_SERVER` env variable if needed.
- **Manifest warning:** If the log shows “Manifest not found… Run `pnpm build`”, it means the build artifacts are missing and the dev server is offline. Either restart `pnpm dev` or generate a fresh build.

## Production Build Workflow
1. Ensure `pnpm install` has run.
2. Execute `pnpm build`. The output lands in `/dist` with an updated `manifest.json`.
3. Verify the WordPress site with the dev server stopped to ensure it reads from `/dist`.
4. Commit the new `/dist` artifacts only if the deployment process requires them (otherwise they can be generated during deployment).

## Common Customizations
- **Global styles:** Edit `src/resources/styles/main.css` for front-end defaults. Tailwind utilities are available because Tailwind is imported at the top of the file.
- **Editor styles:** Use `src/resources/styles/editor.css` to tweak the block editor appearance.
- **Scripts:** Extend `src/resources/scripts/main.js` or `editor.js` for site or editor behaviors. Import new modules using relative paths or the `@` alias (points to `src/`).
- **Adding blocks:** Duplicate `src/blocks/apenas-referencia/`, update `block.json` (`name`, `title`, etc.), wire custom logic in `edit.js`/`render.php`, and import the block in `src/blocks/index.js`.
- **Theme metadata:** Adjust fields like `Description`, `Author`, or version in `src/style.css`.
- **Asset handles:** JS/CSS handles are prefixed with `trydo-wp-theme-bolierplate-…`. Keep this consistent when registering additional assets.

## Decision Log
- **Asset restructure (2024):** Renamed `/src/assets` to `/src/resources` and split contents into `styles/`, `scripts/`, `fonts/`, `images/` for clarity and future growth.
- **Theme rebrand (2024):** Updated theme slug, text domain, and all PHP/JS prefixes from `teste` to `trydo-wp-theme-bolierplate` to avoid collisions and make translations consistent.
- **Module split (2024):** Moved bootstrap logic from `functions.php` into dedicated files under `src/inc/` to improve readability and reuse.

> When you land a change that affects the build process, architecture, or conventions, append a new bullet here with the date, summary, and rationale.

## Maintenance Checklist Before Committing
- [ ] Run the relevant dev/build command and confirm the site behaves as expected.
- [ ] Update this journal with notable changes or fixes.
- [ ] Mention any new environment variables or configuration toggles introduced.
- [ ] If a workaround was required (e.g., for dev server access), document the steps here for future reference.
