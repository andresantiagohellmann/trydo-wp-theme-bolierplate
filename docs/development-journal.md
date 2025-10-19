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
- **Blocks** (`src/inc/blocks.php`): Auto-registers block directories under `src/blocks`, attaches `render.php` as needed, and creates a custom "Trydo Blocks" category that appears first in the editor.

## Asset & Content Structure

- Global styles live in `src/resources/styles/` and scripts in `src/resources/scripts/`. `fonts/` and `images/` are reserved for static assets.
- **Modular CSS:** Estilos customizados são organizados em `src/resources/styles/custom/`:
    - `fonts.css` - Declarações `@font-face`
    - `colors.css` - Paleta de cores OKLCH
    - `typography.css` - Famílias de fontes e tamanhos fluidos
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

_Problema: O `@layer base` do Tailwind pode sobrescrever estes estilos devido à ordem de processamento do Vite._

**✅ FAÇA (estilos FORA de layers):**

```css
@reference "../../resources/styles/main.css";

/* Estilos fora de @layer têm prioridade sobre estilos dentro de layers */
.wp-block-meu-bloco__title {
	@apply text-2xl font-semibold;
}
```

_Solução: Estilos fora de layers têm prioridade absoluta sobre todos os estilos dentro de layers, incluindo o reset do Tailwind._

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

### Color Palette - OKLCH

O tema usa um sistema de cores moderno baseado em **OKLCH** (perceptualmente uniforme) com 3 paletas principais + 2 cores neutras.

#### Paleta de Cores:

**Cores Neutras:**

- `light` - Branco (#ffffff)
- `dark` - Preto escuro (#1a1a1a)

**Primary (Blue - vibrant, modern):**

- `primary-thin` - oklch(95% 0.03 250) - Background suave
- `primary-light` - oklch(80% 0.08 250) - Hover states
- `primary-regular` - oklch(65% 0.15 250) - **Cor base**
- `primary-medium` - oklch(50% 0.18 250) - CTAs importantes
- `primary-bold` - oklch(35% 0.15 250) - Textos escuros

**Secondary (Orange - warm, energetic):**

- `secondary-thin` - oklch(95% 0.03 50)
- `secondary-light` - oklch(80% 0.08 50)
- `secondary-regular` - oklch(68% 0.15 50) - **Cor base**
- `secondary-medium` - oklch(55% 0.18 50)
- `secondary-bold` - oklch(40% 0.15 50)

**Tertiary (Yellow - bright, optimistic):**

- `tertiary-thin` - oklch(95% 0.05 95)
- `tertiary-light` - oklch(88% 0.12 95)
- `tertiary-regular` - oklch(80% 0.18 95) - **Cor base**
- `tertiary-medium` - oklch(70% 0.20 95)
- `tertiary-bold` - oklch(55% 0.18 95)

**Success (Green - positive, confirmation):**

- `success-thin` - oklch(95% 0.03 145)
- `success-light` - oklch(85% 0.08 145)
- `success-regular` - oklch(70% 0.15 145) - **Cor base**
- `success-medium` - oklch(55% 0.18 145)
- `success-bold` - oklch(40% 0.15 145)

**Error (Red - alert, danger):**

- `error-thin` - oklch(95% 0.03 25)
- `error-light` - oklch(85% 0.10 25)
- `error-regular` - oklch(65% 0.20 25) - **Cor base**
- `error-medium` - oklch(50% 0.22 25)
- `error-bold` - oklch(35% 0.18 25)

#### Como usar:

**No Tailwind (blocos customizados):**

```jsx
<button className="bg-primary-regular text-light hover:bg-primary-medium">
  Botão Primary
</button>

<div className="bg-secondary-thin text-secondary-bold">
  Card com cores secundárias
</div>
```

**No WordPress Editor (blocos nativos):**

- As cores aparecem no painel de cores do editor
- Classes geradas automaticamente: `has-primary-regular-background-color`, `has-primary-regular-color`

**Em CSS:**

```css
.my-component {
	background-color: var(--color-primary-regular);
	color: var(--color-light);
}
```

#### Vantagens do OKLCH:

- ✅ Cores mais vibrantes e precisas
- ✅ Perceptualmente uniforme (transições suaves)
- ✅ Suporte a wide-gamut displays
- ✅ Melhor contraste e acessibilidade

### Fluid Typography - Sistema Responsivo

O tema implementa **tipografia fluida** usando `clamp()` do CSS, que escala automaticamente entre viewports.

#### Tamanhos de Fonte:

| Nome        | Slug      | Mobile (320px)  | Desktop (1600px+) | Fórmula clamp()                         |
| ----------- | --------- | --------------- | ----------------- | --------------------------------------- |
| Small       | `small`   | 0.875rem (14px) | 1rem (16px)       | `clamp(0.875rem, 0.8rem + 0.4vw, 1rem)` |
| Medium      | `medium`  | 1rem (16px)     | 1.125rem (18px)   | `clamp(1rem, 0.9rem + 0.5vw, 1.125rem)` |
| Large       | `large`   | 1.5rem (24px)   | 2rem (32px)       | `clamp(1.5rem, 1.2rem + 1vw, 2rem)`     |
| Extra Large | `x-large` | 2rem (32px)     | 3rem (48px)       | `clamp(2rem, 1.5rem + 2vw, 3rem)`       |

#### Como usar:

**No Tailwind (blocos customizados):**

```jsx
<p className="text-small">Texto pequeno responsivo</p>
<h2 className="text-large">Heading responsivo</h2>
<h1 className="text-x-large">Hero title responsivo</h1>
```

**No WordPress Editor (blocos nativos):**

- Aparece no dropdown de tamanhos de fonte
- Classes geradas: `has-small-font-size`, `has-medium-font-size`, etc.

**Em CSS:**

```css
.my-text {
	font-size: var(--font-size-medium);
}
```

#### Como funciona:

- **Mobile** (≤ 768px): Usa o tamanho mínimo
- **Tablet/Desktop** (768px - 1600px): Escala fluida usando `vw`
- **Large Desktop** (≥ 1600px): Usa o tamanho máximo (evita textos gigantes)

#### Vantagens:

- ✅ Zero media queries necessárias
- ✅ Escala perfeita em qualquer dispositivo
- ✅ Suporte nativo do WordPress 6.1+
- ✅ Performance otimizada (CSS puro)

### Custom Fonts

O tema suporta fontes customizadas auto-hospedadas usando `@font-face` + Tailwind v4.

#### Estrutura:

```
src/resources/fonts/
├── SpaceGrotesk-VariableFont_wght.woff2
├── Merriweather-VariableFont_opsz,wdth,wght.woff2
└── Merriweather-Italic-VariableFont_opsz,wdth,wght.woff2
```

#### Configuração em `main.css`:

```css
@font-face {
	font-family: 'Space Grotesk';
	src: url('../fonts/SpaceGrotesk-VariableFont_wght.woff2') format('woff2');
	font-weight: 300 700;
	font-style: normal;
	font-display: swap;
}

@theme {
	/* Tailwind convention - standard font families */
	--font-sans: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
	--font-serif: 'Merriweather', ui-serif, Georgia, serif;

	/* Custom aliases - project-specific naming */
	--font-body: var(--font-sans);
	--font-heading: var(--font-serif);
	--font-emphasis: var(--font-serif);
}
```

#### Como usar:

**Convenção Tailwind padrão:**

```jsx
<h1 className="font-serif text-4xl">Título</h1>
<p className="font-sans">Corpo do texto</p>
```

**Aliases customizados:**

```jsx
<h1 className="font-heading text-4xl">Título</h1>
<p className="font-body">Corpo do texto</p>
<em className="font-emphasis italic">Texto em ênfase</em>
```

**Em CSS com @apply:**

```css
.my-component {
	@apply font-body text-base;
}

.my-heading {
	@apply font-heading text-3xl font-bold;
}
```

#### Adicionando novas fontes:

1. Baixe a fonte em `.woff2` (recomendado: [google-webfonts-helper](https://gwfh.mranftl.com/))
2. Coloque em `src/resources/fonts/`
3. Adicione `@font-face` em `main.css`
4. Defina no `@theme` do Tailwind
5. Use com classes utilitárias ou `@apply`

**Vantagens desta abordagem:**

- ✅ Performance máxima (zero requests externos)
- ✅ GDPR compliant (sem conexão com Google)
- ✅ Vite otimiza automaticamente (hashing, compressão)
- ✅ Suporte a variable fonts
- ✅ Cache control total

### Global Styles

Edit `src/resources/styles/main.css` for front-end defaults. Tailwind utilities are available because Tailwind is imported at the top of the file.

**Exemplo:**

```css
@import 'tailwindcss';

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
├── edit.jsx          # Componente React de edição com JSX (obrigatório)
├── style.css         # Estilos do front-end (opcional)
├── editor.css        # Estilos do editor (opcional)
├── view.js           # JavaScript interativo do front-end (opcional)
└── render.php        # Template PHP para dynamic blocks (opcional)
```

#### 2. Configure o `block.json`:

```json
{
	"apiVersion": 3,
	"name": "trydo-wp-theme-bolierplate/meu-novo-bloco",
	"title": "Meu Novo Bloco",
	"category": "trydo-blocks",
	"icon": "smiley",
	"description": "Descrição do bloco",
	"supports": {
		"html": false
	},
	"textdomain": "trydo-wp-theme-bolierplate",
	"render": "file:./render.php"
}
```

**Nota:** Use `"category": "trydo-blocks"` para que o bloco apareça na categoria customizada "Trydo Blocks", que é exibida em primeiro lugar no editor.

#### 3. Crie o `index.js`:

```javascript
import metadata from './block.json';
import Edit from './edit.jsx';
import './editor.css'; // Opcional

const { registerBlockType } = wp.blocks;
const { name, ...settings } = metadata;

registerBlockType(name, {
	...settings,
	edit: Edit,
	save: () => null, // Dynamic block
});
```

#### 4. Crie o `edit.jsx`:

**IMPORTANTE:** Use JSX (`.jsx`) em vez de `createElement`. É muito mais produtivo e legível!

```jsx
const { __ } = wp.i18n;
const { useBlockProps, RichText } = wp.blockEditor;

const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-meu-novo-bloco';

export default function Edit({ attributes, setAttributes }) {
	const { title, description } = attributes;

	const blockProps = useBlockProps({
		className: BLOCK_CLASS,
	});

	return (
		<div {...blockProps}>
			<RichText
				tagName="h3"
				className={`${BLOCK_CLASS}__title`}
				value={title}
				onChange={(value) => setAttributes({ title: value })}
				placeholder={__('Adicionar título…', 'trydo-wp-theme-bolierplate')}
			/>
			<RichText
				tagName="p"
				className={`${BLOCK_CLASS}__description`}
				value={description}
				onChange={(value) => setAttributes({ description: value })}
				placeholder={__('Adicionar descrição…', 'trydo-wp-theme-bolierplate')}
			/>
		</div>
	);
}
```

**Por que JSX?**

- ✅ Sintaxe mais limpa e legível
- ✅ Similar ao HTML/PHP do `render.php`
- ✅ Mais produtivo do que `createElement`
- ✅ Vite processa JSX automaticamente, sem configuração adicional

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

#### 8. Crie o `view.js` (opcional, para interatividade no front-end):

O `view.js` adiciona JavaScript interativo ao bloco no front-end (não afeta o editor).

```javascript
const BLOCK_CLASS = 'wp-block-trydo-wp-theme-bolierplate-meu-novo-bloco';

document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll(`.${BLOCK_CLASS}`);

	blocks.forEach((block) => {
		const button = block.querySelector(`.${BLOCK_CLASS}__button`);

		if (!button) return;

		button.addEventListener('click', (event) => {
			// Adicione sua lógica aqui
			alert('Botão clicado!');
		});
	});
});
```

**Não esqueça de declarar no `block.json`:**

```json
{
	"render": "file:./render.php",
	"viewScript": "file:./view.js"
}
```

**Casos de uso para `view.js`:**

- Carrosséis/sliders
- Tabs/accordions
- Modais/lightboxes
- Animações on scroll
- Validação de formulários
- Analytics/tracking

**Pronto!** O bloco será automaticamente reconhecido e carregado. Não é necessário editar `src/blocks/index.js`, `main.js` ou `editor.js`.

### Theme Metadata

Adjust fields like `Description`, `Author`, or version in `src/style.css`.

### Asset Handles

JS/CSS handles are prefixed with `trydo-wp-theme-bolierplate-…`. Keep this consistent when registering additional assets.

## Development Workflow

### Getting Started

1. **Install dependencies:**

    ```bash
    pnpm install
    ```

2. **Start development server:**

    ```bash
    pnpm dev
    ```

3. **Build for production:**
    ```bash
    pnpm build
    ```

### Code Quality Tools

Este projeto usa ferramentas modernas para manter a qualidade e consistência do código:

#### EditorConfig

Garante formatação consistente entre diferentes editores e IDEs. Configurado em `.editorconfig` com:

- Tabs para indentação (PHP/JS/CSS)
- Spaces para JSON/YAML
- UTF-8 encoding
- LF line endings

#### ESLint

Linting para JavaScript/JSX com regras específicas para WordPress e React.

**Comandos:**

```bash
pnpm lint:js           # Check for linting errors
pnpm lint:js --fix     # Auto-fix linting errors
```

**Configuração:** `eslint.config.js` (flat config format)

- Suporte a WordPress globals (`wp`, `jQuery`)
- React JSX rules
- Best practices modernas

#### Prettier

Formatação automática de código para JS, JSX, JSON, CSS, Markdown, PHP e HTML.

**Comandos:**

```bash
pnpm format            # Format all files
pnpm format:check      # Check if files are formatted
```

**Configuração:** `.prettierrc`

- Tabs para indentação
- Single quotes
- 100 caracteres por linha
- Trailing commas (ES5)
- **Auto-sort de classes Tailwind** (via `prettier-plugin-tailwindcss`)
- **Suporte a PHP** (via `@prettier/plugin-php`)

**Auto-sort de Classes Tailwind:**

O Prettier ordena automaticamente as classes Tailwind seguindo a ordem recomendada oficial:

```jsx
// Antes
<div className="p-4 mt-2 bg-blue-500 text-white rounded-lg">

// Depois (automaticamente ordenado)
<div className="mt-2 rounded-lg bg-blue-500 p-4 text-white">
```

**Tipos de arquivo suportados:**

- ✅ **JSX/TSX**: `className="..."`
- ✅ **HTML**: `class="..."`
- ✅ **CSS**: `@apply ...`
- ✅ **PHP**: `class="..."` em blocos HTML (strings PHP não são ordenadas)

**IMPORTANTE:** O auto-sort roda automaticamente:

1. Ao salvar no VSCode (se "Format on Save" estiver habilitado)
2. Ao executar `pnpm format`
3. Nos pre-commit hooks (antes de cada commit)

#### Stylelint

Linting para CSS com suporte específico para Tailwind CSS v4.

**Comandos:**

```bash
pnpm lint:css          # Check CSS files
pnpm lint:css --fix    # Auto-fix CSS issues
```

**Configuração:** `.stylelintrc.json`

- Ignora diretivas do Tailwind v4 (`@reference`, `@layer`, `@apply`)
- Ignora função `theme()`
- Desabilita regras que conflitam com Tailwind

#### Lint-Staged + Husky

Pre-commit hooks que rodam automaticamente antes de cada commit.

**O que acontece no pre-commit:**

1. ESLint + auto-fix nos arquivos `.js` e `.jsx` modificados
2. Stylelint + auto-fix nos arquivos `.css` modificados
3. Prettier nos arquivos modificados
4. Se houver erros não corrigíveis, o commit é bloqueado

**Configuração:**

- `.husky/pre-commit`: Hook de pre-commit
- `package.json`: Configuração do `lint-staged`

**Para pular o pre-commit hook (use apenas quando necessário):**

```bash
git commit --no-verify -m "message"
```

### VSCode Integration

O projeto inclui configurações recomendadas do VSCode em `.vscode/`:

#### Settings (`.vscode/settings.json`)

- Format on save habilitado
- ESLint auto-fix on save
- Stylelint auto-fix on save
- Tailwind IntelliSense configurado
- Validação CSS nativa desabilitada (usa Stylelint)

#### Extensões Recomendadas (`.vscode/extensions.json`)

Instale estas extensões para melhor experiência de desenvolvimento:

1. **Prettier** - Formatação de código
2. **ESLint** - Linting JavaScript
3. **Stylelint** - Linting CSS
4. **Tailwind CSS IntelliSense** - Autocomplete Tailwind
5. **EditorConfig** - Suporte a .editorconfig
6. **Path Intellisense** - Autocomplete de paths
7. **HTML CSS Class Completion** - Autocomplete de classes
8. **Intelephense** - PHP IntelliSense

**Como instalar:**
No VSCode, abra a paleta de comandos (Cmd/Ctrl+Shift+P) e digite "Show Recommended Extensions".

### Scripts Disponíveis

```bash
# Development
pnpm dev               # Inicia Vite dev server com HMR
pnpm build             # Build de produção
pnpm preview           # Preview do build de produção

# Code Quality
pnpm lint              # Roda ESLint + Stylelint
pnpm lint:js           # Roda apenas ESLint
pnpm lint:css          # Roda apenas Stylelint
pnpm format            # Formata todos os arquivos
pnpm format:check      # Verifica se arquivos estão formatados
```

### Boas Práticas

1. **Sempre rode `pnpm lint` antes de commitar** (ou confie nos pre-commit hooks)
2. **Use `pnpm format` para formatar o código** antes de abrir PRs
3. **Não desabilite as regras do linter** sem discutir com a equipe
4. **Mantenha o `development-journal.md` atualizado** com mudanças arquiteturais
5. **Use JSX em vez de createElement** para componentes de blocos
6. **Coloque estilos de blocos FORA de @layer** para evitar sobrescrita do Tailwind

## Decision Log

- **Asset restructure (2024):** Renamed `/src/assets` to `/src/resources` and split contents into `styles/`, `scripts/`, `fonts/`, `images/` for clarity and future growth.
- **Theme rebrand (2024):** Updated theme slug, text domain, and all PHP/JS prefixes from `teste` to `trydo-wp-theme-bolierplate` to avoid collisions and make translations consistent.
- **Module split (2024):** Moved bootstrap logic from `functions.php` into dedicated files under `src/inc/` to improve readability and reuse.
- **Auto-discovery de blocos (2024):** `src/blocks/index.js`, `main.js` e `editor.js` passaram a usar `import.meta.glob` para carregar dinamicamente novos blocos e seus estilos, eliminando ajustes manuais ao criar um bloco.
- **CSS Cascade Layers fix (Outubro 2024):** Removemos `@layer theme` dos arquivos CSS dos blocos (`style.css` e `editor.css`) para evitar que o `@layer base` do Tailwind sobrescreva os estilos dos blocos. Razão: Quando usado com `@reference` e `import.meta.glob`, o Vite processa os arquivos em paralelo, causando uma ordem de layers onde `theme` aparece antes de `base` no arquivo compilado. Como não há declaração explícita de ordem de layers no output do Tailwind v4, o CSS usa ordem de aparição, fazendo o `base` sobrescrever `theme`. Solução: Estilos fora de layers têm precedência absoluta sobre estilos dentro de layers, garantindo que os blocos não sejam afetados pelo reset do Tailwind.
- **HMR optimization no editor (Outubro 2024):** `src/resources/styles/editor.css` passou a usar `@reference "./main.css"` em vez de `@import "tailwindcss"` para compartilhar configurações do Tailwind sem reimportar o framework. Isso mantém o HMR (Hot Module Replacement) funcionando corretamente no editor e evita duplicação de CSS no bundle final.
- **JSX para componentes de blocos (Outubro 2024):** Migração de `createElement` para JSX nos componentes `Edit` dos blocos. Arquivos `edit.js` renomeados para `edit.jsx`. Razão: JSX oferece sintaxe mais limpa e produtiva, similar ao HTML/PHP usado no `render.php`, facilitando o desenvolvimento. O Vite já suporta JSX nativamente sem necessidade de configuração adicional.
- **Categoria customizada de blocos (Outubro 2024):** Criação da categoria "Trydo Blocks" que aparece em primeiro lugar no inseridor de blocos do editor. Todos os blocos do tema usam `"category": "trydo-blocks"` no `block.json`. Razão: Melhor organização e descoberta dos blocos do tema, separando-os dos blocos nativos do WordPress e de plugins.
- **Suporte a view.js no boilerplate (Outubro 2024):** Adicionado arquivo `view.js` ao bloco boilerplate para demonstrar JavaScript interativo no front-end. O WordPress carrega automaticamente via `"viewScript": "file:./view.js"` no `block.json`, enfileirando o script apenas em páginas que contêm o bloco. Razão: Fornece exemplo prático de interatividade no front-end, separado do JavaScript do editor.
- **Modernização das ferramentas de desenvolvimento (Outubro 2024):** Adicionado stack completo de ferramentas de qualidade de código: EditorConfig, ESLint (flat config), Prettier, Stylelint (com suporte Tailwind v4), Husky + lint-staged para pre-commit hooks, e configurações VSCode. Razão: Manter consistência de código, automatizar formatação, prevenir erros comuns, e melhorar a experiência de desenvolvimento. As ferramentas rodam automaticamente antes de cada commit via hooks, garantindo que o código sempre esteja formatado e livre de erros básicos.
- **Auto-sort de classes Tailwind (Outubro 2024):** Adicionado `prettier-plugin-tailwindcss` e `@prettier/plugin-php` para ordenar automaticamente classes Tailwind em JSX, HTML, CSS (`@apply`) e PHP. Razão: Classes Tailwind organizadas de forma consistente facilitam a leitura e manutenção do código. O plugin segue a ordem recomendada pelo Tailwind (layout → spacing → typography → visual → etc). Funciona automaticamente no format-on-save e nos pre-commit hooks. Limitação conhecida: strings PHP não são ordenadas, apenas atributos HTML em arquivos PHP.
- **Custom fonts com abordagem híbrida (Outubro 2024):** Implementado sistema de fontes customizadas auto-hospedadas usando `@font-face` + Tailwind v4 `@theme`. Fontes: Space Grotesk (sans-serif) e Merriweather (serif + italic). Razão: Performance máxima (zero requests externos), GDPR compliant, controle total sobre cache e otimizações. Abordagem híbrida: usa convenções Tailwind padrão (`--font-sans`, `--font-serif`) + aliases customizados (`--font-body`, `--font-heading`, `--font-emphasis`) para flexibilidade. Variable fonts suportadas para otimização de bundle size. Vite processa e otimiza automaticamente (hashing, compressão).
- **Integração Tailwind v4 + theme.json com OKLCH e fluid typography (Outubro 2024):** Implementado sistema completo de cores e tipografia sincronizado entre Tailwind e WordPress. Paleta OKLCH com 5 cores principais (primary blue, secondary orange, tertiary yellow, success green, error red) × 5 shades cada (thin/light/regular/medium/bold) + 2 cores neutras (light/dark). Total: 27 cores. Tipografia fluida com 4 tamanhos responsivos usando `clamp()` (small/medium/large/x-large). Razão: theme.json define cores e fontes para blocos nativos do WordPress (parágrafo, heading), enquanto Tailwind v4 usa as mesmas variáveis via `@theme` para blocos customizados. OKLCH escolhido por cores mais vibrantes, perceptualmente uniformes e wide-gamut. Fluid typography elimina media queries e escala perfeitamente entre mobile (320px) e desktop (1600px+). Ambos sincronizados manualmente mas com convenção clara de nomes para manter consistência.
- **Organização modular de estilos customizados (Outubro 2024):** Criado `src/resources/styles/custom/` com arquivos separados para fonts.css, colors.css e typography.css, importados no main.css. Razão: Melhor organização, manutenção facilitada, separação de responsabilidades (cada arquivo cuida de uma concern específica). Permite editar cores, fontes ou tipografia sem mexer em um arquivo gigante. Facilita onboarding de novos desenvolvedores e versionamento mais claro.

> When you land a change that affects the build process, architecture, or conventions, append a new bullet here with the date, summary, and rationale.

## Maintenance Checklist Before Committing

- [ ] Run the relevant dev/build command and confirm the site behaves as expected.
- [ ] Update this journal with notable changes or fixes.
- [ ] Mention any new environment variables or configuration toggles introduced.
- [ ] If a workaround was required (e.g., for dev server access), document the steps here for future reference.
