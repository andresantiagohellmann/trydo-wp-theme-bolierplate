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

## CSS Architecture & Tailwind v4

### Tailwind CSS v4 Integration
O tema utiliza **Tailwind CSS v4** integrado via `@tailwindcss/vite`. Diferente do v3, o v4 não usa `tailwind.config.js` e aplica configurações diretamente nos arquivos CSS através de diretivas.

**Arquivos principais:**
- `src/resources/styles/main.css`: Importa o Tailwind para o front-end e define estilos globais do tema
- `src/resources/styles/editor.css`: Usa `@reference "./main.css"` para compartilhar configurações do Tailwind sem reimportar o framework
- `src/blocks/*/style.css`: Estilos do bloco no front-end, usa `@reference` para acessar utilitários do Tailwind
- `src/blocks/*/editor.css`: Estilos do bloco no editor, usa `@reference` para acessar utilitários do Tailwind

### CSS Cascade Layers Strategy

**IMPORTANTE:** Este tema usa uma estratégia específica para evitar que estilos do Tailwind sobrescrevam estilos dos blocos.

#### Ordem de precedência no CSS Cascade Layers:
1. **Estilos FORA de layers** (maior prioridade)
2. `@layer utilities`
3. `@layer theme`
4. `@layer components`
5. `@layer base` (menor prioridade)

#### Implementação nos blocos:

**❌ NÃO FAÇA (estilos dentro de @layer theme):**
```css
@reference "../../resources/styles/main.css";

@layer theme {
  .wp-block-meu-bloco__title {
    @apply text-2xl font-semibold;
  }
}
```
*Problema: O `@layer base` do Tailwind pode sobrescrever estes estilos devido à ordem de processamento do Vite.*

**✅ FAÇA (estilos FORA de layers):**
```css
@reference "../../resources/styles/main.css";

/* Estilos fora de @layer têm prioridade sobre estilos dentro de layers */
.wp-block-meu-bloco__title {
  @apply text-2xl font-semibold;
}
```
*Solução: Estilos fora de layers têm prioridade absoluta sobre todos os estilos dentro de layers, incluindo o reset do Tailwind.*

#### Como o @reference funciona:
- `@reference` é uma diretiva do Tailwind v4 que permite compartilhar configurações entre arquivos CSS
- Arquivos que usam `@reference` podem acessar utilitários do Tailwind via `@apply` sem reimportar o framework
- Isso evita duplicação de código e mantém o bundle otimizado
- `editor.css` usa `@reference "./main.css"` para manter HMR (Hot Module Replacement) funcionando corretamente

#### Estrutura de imports:

**JavaScript (`src/resources/scripts/main.js`):**
```javascript
import '../styles/main.css';
const blockStyles = import.meta.glob('@/blocks/**/style.css', { eager: true });
```

**JavaScript (`src/resources/scripts/editor.js`):**
```javascript
import '../styles/editor.css';
import.meta.glob('@/blocks/**/editor.css', { eager: true });
```

O `import.meta.glob` carrega automaticamente todos os arquivos CSS dos blocos, eliminando a necessidade de importá-los manualmente.

## Local Development Workflow
1. **Install dependencies:** `pnpm install`.
2. **Configure host/port (optional):** set `WP_VITE_HOST` and `WP_VITE_PORT` in your environment if you need something other than `127.0.0.1:5173`.
3. **Run dev server:** `pnpm dev`. The Vite helpers look for the dev server via `trydo_wp_theme_bolierplate_vite_dev_server_origin()`.
4. **Load the theme in WordPress:** With the dev server online, WordPress will enqueue the live bundle instead of the built manifest. If the site can’t reach the dev URL, WordPress falls back to the last build.
5. **Block development:** Any time you scaffold a new block under `src/blocks`, its `index.js` will be pulled into the build via `src/blocks/index.js`. Hot reloading works for both blocks and theme assets while the dev server is running.

### Troubleshooting Dev Mode
- **Dev server not detected:** Check the browser console for 404s to `@vite/client`. Confirm `pnpm dev` is running and that the host/port matches any reverse proxy or Docker network you're using. Override with the `trydo_wp_theme_bolierplate_vite_dev_server_origin` filter or `WP_VITE_SERVER` env variable if needed.
- **Manifest warning:** If the log shows "Manifest not found… Run `pnpm build`", it means the build artifacts are missing and the dev server is offline. Either restart `pnpm dev` or generate a fresh build.
- **HMR não funciona no editor:** Verifique se `src/resources/styles/editor.css` está usando `@reference "./main.css"` e NÃO `@import "tailwindcss"`. Importar o Tailwind duas vezes quebra o HMR.
- **Estilos dos blocos sendo sobrescritos:** Se estilos como `font-size`, `margin`, ou `padding` dos blocos estão sendo ignorados, verifique se os arquivos CSS dos blocos (`style.css` e `editor.css`) NÃO estão usando `@layer theme` ou qualquer outra layer. Os estilos devem estar diretamente no arquivo, fora de qualquer `@layer`. Exemplo correto:
  ```css
  @reference "../../resources/styles/main.css";

  /* Sem @layer aqui! */
  .wp-block-meu-bloco {
    @apply text-2xl font-bold;
  }
  ```
- **Erro "Cannot apply unknown utility class":** Isso indica que o arquivo CSS não tem acesso ao Tailwind. Verifique se há um `@reference` no topo do arquivo apontando para `main.css` (front-end) ou `editor.css` (editor).
- **Bundle CSS muito grande:** Se o bundle cresceu muito após adicionar blocos, pode estar havendo duplicação do Tailwind. Verifique se nenhum arquivo está usando `@import "tailwindcss"` além do `main.css`. Outros arquivos devem usar `@reference`.

## Production Build Workflow
1. Ensure `pnpm install` has run.
2. Execute `pnpm build`. The output lands in `/dist` with an updated `manifest.json`.
3. Verify the WordPress site with the dev server stopped to ensure it reads from `/dist`.
4. Commit the new `/dist` artifacts only if the deployment process requires them (otherwise they can be generated during deployment).

## Common Customizations

### Global Styles
Edit `src/resources/styles/main.css` for front-end defaults. Tailwind utilities are available because Tailwind is imported at the top of the file.

**Exemplo:**
```css
@import "tailwindcss";

@layer theme {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

### Editor Styles
Use `src/resources/styles/editor.css` para ajustar a aparência do editor de blocos. Este arquivo usa `@reference "./main.css"` para compartilhar as configurações do Tailwind.

**IMPORTANTE:** Não importe `@import "tailwindcss"` novamente no `editor.css`, pois isso quebraria o HMR e duplicaria o CSS.

### Scripts
Extend `src/resources/scripts/main.js` or `editor.js` for site or editor behaviors. Import new modules using relative paths or the `@` alias (points to `src/`).

### Adicionando Novos Blocos

O sistema carrega automaticamente todos os blocos em `src/blocks/*/`. Para criar um novo bloco:

#### 1. Crie a estrutura de pastas:
```
src/blocks/meu-novo-bloco/
├── block.json        # Metadados do bloco (obrigatório)
├── index.js          # Registro do bloco (obrigatório)
├── edit.js           # Componente React de edição (obrigatório)
├── style.css         # Estilos do front-end (opcional)
├── editor.css        # Estilos do editor (opcional)
└── render.php        # Template PHP para dynamic blocks (opcional)
```

#### 2. Configure o `block.json`:
```json
{
  "apiVersion": 3,
  "name": "trydo-wp-theme-bolierplate/meu-novo-bloco",
  "title": "Meu Novo Bloco",
  "category": "common",
  "icon": "smiley",
  "description": "Descrição do bloco",
  "supports": {
    "html": false
  },
  "textdomain": "trydo-wp-theme-bolierplate",
  "editorScript": "file:./index.js"
}
```

#### 3. Crie o `index.js`:
```javascript
import metadata from './block.json';
import Edit from './edit.js';
import './editor.css'; // Opcional

const { registerBlockType } = wp.blocks;
const { name, ...settings } = metadata;

registerBlockType(name, {
  ...settings,
  edit: Edit,
  save: () => null, // Dynamic block
});
```

#### 4. Crie o `edit.js`:
```javascript
export default function Edit() {
  return (
    <div className="wp-block-trydo-wp-theme-bolierplate-meu-novo-bloco">
      <h3>Meu Novo Bloco</h3>
      <p>Conteúdo do bloco no editor</p>
    </div>
  );
}
```

#### 5. Crie o `style.css` (IMPORTANTE):
```css
@reference "../../resources/styles/main.css";

/* Estilos fora de @layer têm prioridade sobre estilos dentro de layers */
.wp-block-trydo-wp-theme-bolierplate-meu-novo-bloco {
  @apply rounded-lg bg-white p-6 shadow-md;
}

.wp-block-trydo-wp-theme-bolierplate-meu-novo-bloco h3 {
  @apply text-xl font-bold;
}
```

**⚠️ NUNCA use `@layer theme` ou qualquer outra layer nos estilos dos blocos!** Isso causará problemas de precedência onde o reset do Tailwind (`@layer base`) sobrescreverá seus estilos.

#### 6. Crie o `editor.css` (opcional):
```css
@reference "../../resources/styles/editor.css";

/* Estilos específicos do editor, fora de layers */
.wp-block-trydo-wp-theme-bolierplate-meu-novo-bloco {
  @apply border-2 border-dashed border-gray-300;
}
```

#### 7. Crie o `render.php` (para dynamic blocks):
```php
<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
  <h3>Meu Novo Bloco</h3>
  <p>Conteúdo renderizado no front-end</p>
</div>
```

**Pronto!** O bloco será automaticamente reconhecido e carregado. Não é necessário editar `src/blocks/index.js`, `main.js` ou `editor.js`.

### Theme Metadata
Adjust fields like `Description`, `Author`, or version in `src/style.css`.

### Asset Handles
JS/CSS handles are prefixed with `trydo-wp-theme-bolierplate-…`. Keep this consistent when registering additional assets.

## Decision Log
- **Asset restructure (2024):** Renamed `/src/assets` to `/src/resources` and split contents into `styles/`, `scripts/`, `fonts/`, `images/` for clarity and future growth.
- **Theme rebrand (2024):** Updated theme slug, text domain, and all PHP/JS prefixes from `teste` to `trydo-wp-theme-bolierplate` to avoid collisions and make translations consistent.
- **Module split (2024):** Moved bootstrap logic from `functions.php` into dedicated files under `src/inc/` to improve readability and reuse.
- **Auto-discovery de blocos (2024):** `src/blocks/index.js`, `main.js` e `editor.js` passaram a usar `import.meta.glob` para carregar dinamicamente novos blocos e seus estilos, eliminando ajustes manuais ao criar um bloco.
- **CSS Cascade Layers fix (Outubro 2024):** Removemos `@layer theme` dos arquivos CSS dos blocos (`style.css` e `editor.css`) para evitar que o `@layer base` do Tailwind sobrescreva os estilos dos blocos. Razão: Quando usado com `@reference` e `import.meta.glob`, o Vite processa os arquivos em paralelo, causando uma ordem de layers onde `theme` aparece antes de `base` no arquivo compilado. Como não há declaração explícita de ordem de layers no output do Tailwind v4, o CSS usa ordem de aparição, fazendo o `base` sobrescrever `theme`. Solução: Estilos fora de layers têm precedência absoluta sobre estilos dentro de layers, garantindo que os blocos não sejam afetados pelo reset do Tailwind.
- **HMR optimization no editor (Outubro 2024):** `src/resources/styles/editor.css` passou a usar `@reference "./main.css"` em vez de `@import "tailwindcss"` para compartilhar configurações do Tailwind sem reimportar o framework. Isso mantém o HMR (Hot Module Replacement) funcionando corretamente no editor e evita duplicação de CSS no bundle final.

> When you land a change that affects the build process, architecture, or conventions, append a new bullet here with the date, summary, and rationale.

## Maintenance Checklist Before Committing
- [ ] Run the relevant dev/build command and confirm the site behaves as expected.
- [ ] Update this journal with notable changes or fixes.
- [ ] Mention any new environment variables or configuration toggles introduced.
- [ ] If a workaround was required (e.g., for dev server access), document the steps here for future reference.
