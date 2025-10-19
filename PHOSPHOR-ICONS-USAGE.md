# Phosphor Icons - Guia de Uso

O Phosphor Icons Web está integrado no template e funcionará automaticamente em JSX, PHP e HTML.

## Como Usar

Os ícones Phosphor são baseados em **icon fonts** usando tags `<i>` com classes específicas.

### 1. Em arquivos HTML

```html
<!-- Ícone básico (regular weight) -->
<i class="ph ph-heart"></i>

<!-- Com diferentes pesos (weights) -->
<i class="ph-bold ph-heart"></i>
<i class="ph-light ph-heart"></i>
<i class="ph-thin ph-heart"></i>
<i class="ph-fill ph-heart"></i>
<i class="ph-duotone ph-heart"></i>

<!-- Com tamanho (via CSS) -->
<i class="ph ph-heart" style="font-size: 32px"></i>

<!-- Com cor -->
<i class="ph ph-heart" style="color: red"></i>
<i class="ph ph-heart text-primary"></i>

<!-- Exemplo completo -->
<button>
	<i class="ph-bold ph-magnifying-glass"></i>
	Buscar
</button>
```

### 2. Em arquivos PHP (templates e blocos)

```php
<!-- Ícone simples -->
<i class="ph ph-user"></i>

<!-- Com atributos dinâmicos -->
<i class="<?php echo $is_favorite ? 'ph-fill' : 'ph'; ?> ph-star"></i>

<!-- Em loops -->
<?php foreach ($menu_items as $item): ?>
  <a href="<?php echo $item['url']; ?>">
    <i class="ph ph-<?php echo $item['icon']; ?>"></i>
    <?php echo $item['title']; ?>
  </a>
<?php endforeach; ?>

<!-- Exemplo prático em um botão -->
<button class="btn">
  <i class="ph-bold ph-arrow-right"></i>
  Ver mais
</button>
```

### 3. Em arquivos JSX/React

```jsx
// Ícone básico
<i className="ph ph-heart" />

// Com diferentes weights
<i className="ph-fill ph-heart" />
<i className="ph-bold ph-heart" />

// Com inline styles
<i
  className="ph-fill ph-heart"
  style={{ fontSize: '32px', color: 'red' }}
/>

// Com event handlers
<i
  className="ph-fill ph-heart"
  onClick={() => handleLike()}
  style={{ cursor: 'pointer' }}
/>

// Dinâmico
const iconName = 'star';
const isFavorite = true;
<i className={`${isFavorite ? 'ph-fill' : 'ph'} ph-${iconName}`} />

// Em componentes
function FavoriteButton({ isFavorite }) {
  return (
    <button>
      <i className={`${isFavorite ? 'ph-fill' : 'ph'} ph-star`} />
      {isFavorite ? 'Favorited' : 'Favorite'}
    </button>
  );
}
```

## Weights Disponíveis

Cada weight tem sua própria classe CSS:

- `.ph` - regular (padrão)
- `.ph-thin` - thin
- `.ph-light` - light
- `.ph-bold` - bold
- `.ph-fill` - fill (preenchido)
- `.ph-duotone` - duotone (dois tons)

## Ícones Comuns

```html
<!-- Navegação -->
<i class="ph ph-house"></i>
<i class="ph ph-list"></i>
<i class="ph ph-x"></i>
<i class="ph ph-magnifying-glass"></i>

<!-- Social -->
<i class="ph ph-facebook-logo"></i>
<i class="ph ph-instagram-logo"></i>
<i class="ph ph-twitter-logo"></i>
<i class="ph ph-linkedin-logo"></i>

<!-- Ações -->
<i class="ph ph-heart"></i>
<i class="ph ph-share"></i>
<i class="ph ph-download"></i>
<i class="ph ph-upload"></i>
<i class="ph ph-trash"></i>
<i class="ph ph-pencil"></i>

<!-- Navegação/Setas -->
<i class="ph ph-arrow-right"></i>
<i class="ph ph-arrow-left"></i>
<i class="ph ph-caret-down"></i>
<i class="ph ph-caret-up"></i>

<!-- Status -->
<i class="ph ph-check"></i>
<i class="ph ph-warning"></i>
<i class="ph ph-info"></i>
<i class="ph ph-x-circle"></i>

<!-- Mídia -->
<i class="ph ph-play"></i>
<i class="ph ph-pause"></i>
<i class="ph ph-image"></i>
<i class="ph ph-video"></i>
```

## Estilização com CSS

```css
/* Tamanho via font-size */
.ph {
	font-size: 24px;
}

/* Cor */
.ph {
	color: red;
}

/* Hover effects */
.ph:hover {
	color: darkred;
	transform: scale(1.1);
	transition: all 0.2s;
}

/* Responsive */
@media (max-width: 768px) {
	.ph {
		font-size: 16px;
	}
}
```

```html
<!-- Com inline styles -->
<i class="ph ph-heart" style="font-size: 48px; color: #ff0000;"></i>

<!-- Com classes personalizadas -->
<i class="ph ph-heart icon-large text-red-500"></i>
```

## Encontrar Ícones

Navegue todos os ícones disponíveis em: https://phosphoricons.com/

Basta usar o nome do ícone com `ph-` como prefixo. Exemplo:

- "house" vira `ph-house`
- "arrow-right" vira `ph-arrow-right`
- "facebook-logo" vira `ph-facebook-logo`

## Notas Técnicas

- Os ícones são **icon fonts**, funcionam como fontes tipográficas
- São renderizados como glifos de fonte (não SVG inline)
- Todos os weights são carregados automaticamente via Vite no `main.js`
- Para reduzir bundle size, comente os weights que não usar em `src/resources/scripts/main.js`
- Suporte total a CSS (font-size, color, etc.)
- Podem ser estilizados como texto normal

## Otimização de Performance

Se você usar apenas alguns weights, pode comentar os que não precisa em `main.js`:

```js
// main.js
import '@phosphor-icons/web/regular'; // sempre útil
import '@phosphor-icons/web/bold'; // para destaques
// import '@phosphor-icons/web/light';    // comentado se não usar
// import '@phosphor-icons/web/thin';     // comentado se não usar
// import '@phosphor-icons/web/fill';     // comentado se não usar
// import '@phosphor-icons/web/duotone';  // comentado se não usar
```

Isso reduzirá o tamanho do bundle final.
