# ScrollSmoother GSAP - Documentação

## Visão Geral

O ScrollSmoother do GSAP foi implementado de forma simples no tema para proporcionar uma experiência de rolagem suave e fluida apenas no front-end do site.

## Estrutura Simplificada

### Arquivos

1. **[src/inc/smooth-scroll.php](src/inc/smooth-scroll.php)**
    - Apenas adiciona a classe `smooth-scroll-enabled` ao body no front-end

2. **[src/resources/scripts/scroll-smoother.js](src/resources/scripts/scroll-smoother.js)**
    - Inicializa o ScrollSmoother do GSAP
    - Configurações otimizadas para performance
    - Suporte a parallax com data attributes

3. **[src/resources/styles/custom/scroll-smoother.css](src/resources/styles/custom/scroll-smoother.css)**
    - Estilos mínimos necessários (overflow, posicionamento)

4. **[src/templates/\*.html](src/templates/)**
    - Estrutura HTML com `#smooth-wrapper` e `#smooth-content`
    - Header **fora** do wrapper (fica fixo)
    - Main e Footer **dentro** do wrapper (com scroll suave)

## Como Funciona

A estrutura HTML está definida diretamente nos templates ([src/templates/index.html](src/templates/index.html)):

```html
<!-- Header FORA do smooth scroll (fica fixo) -->
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- Wrappers do ScrollSmoother -->
<!-- wp:html -->
<div id="smooth-wrapper">
	<div id="smooth-content">
		<!-- /wp:html -->

		<!-- Main DENTRO do smooth scroll -->
		<!-- wp:group {"tagName":"main","layout":{"type":"flow"}} -->
		<main class="wp-block-group">
			<!-- wp:post-content /-->
		</main>
		<!-- /wp:group -->

		<!-- Footer DENTRO do smooth scroll -->
		<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->

		<!-- wp:html -->
	</div>
</div>
<!-- /wp:html -->
```

### No Front-end

- Body recebe a classe `smooth-scroll-enabled`
- ScrollSmoother é inicializado automaticamente
- Header fica fixo no topo
- Main e Footer têm scroll suave

### No Admin/Editor

- ScrollSmoother **não é ativado**
- Edição funciona normalmente

## Configurações

### Parâmetros do ScrollSmoother

Os parâmetros podem ser ajustados em [src/resources/scripts/scroll-smoother.js](src/resources/scripts/scroll-smoother.js#L29):

```javascript
ScrollSmoother.create({
	wrapper: '#smooth-wrapper',
	content: '#smooth-content',
	smooth: 1.5, // Nível de suavidade (0-3)
	effects: true, // Habilita data-speed e data-lag
	smoothTouch: 0.1, // Scroll suave em touch (0 = desabilitado)
	normalizeScroll: true, // Previne address bar mobile
	ignoreMobileResize: true, // Ignora eventos de resize mobile
});
```

## Efeitos Parallax

Você pode adicionar efeitos de parallax aos elementos usando data attributes:

```html
<!-- Move mais devagar que o scroll normal -->
<div data-speed="0.5">Conteúdo lento</div>

<!-- Move mais rápido que o scroll normal -->
<div data-speed="1.5">Conteúdo rápido</div>

<!-- Efeito de lag (atraso) -->
<div data-lag="0.3">Conteúdo com lag</div>
```

## Performance

### Otimizações Aplicadas

- GPU acceleration com `backface-visibility` e `perspective`
- `will-change` para elementos que serão animados
- Normalização de scroll para dispositivos móveis
- Ignorar eventos de resize em mobile

### Debug

Em modo desenvolvimento, o smoother instance está disponível globalmente:

```javascript
// No console do navegador
window.smoother.scrollTo(0); // Volta ao topo
window.smoother.paused(true); // Pausa o smooth scroll
```

## Desabilitar ScrollSmoother

Se você precisar desabilitar o ScrollSmoother temporariamente:

### Opção 1: Remover a classe do body

```php
// Em src/inc/smooth-scroll.php, comente a função:
// add_filter('body_class', 'trydo_wp_theme_bolierplate_add_smooth_scroll_body_class');
```

### Opção 2: Desabilitar o JavaScript

```javascript
// Em src/resources/scripts/main.js, comente:
// import './scroll-smoother.js';
```

### Opção 3: Remover o arquivo de configuração

```php
// Em src/functions.php, comente:
// require_once __DIR__ . '/inc/smooth-scroll.php';
```

## Compatibilidade

- ✅ WordPress 6.0+
- ✅ GSAP 3.13.0+
- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Mobile e touch devices
- ✅ Block Editor (Gutenberg)

## Troubleshooting

### O smooth scroll não está funcionando

1. Verifique se a classe `smooth-scroll-enabled` está no body
2. Verifique se os elementos `#smooth-wrapper` e `#smooth-content` existem
3. Abra o console e veja se há erros JavaScript
4. Verifique se você está no front-end (não no admin)

### O header não está fixo

1. Verifique se o header está **antes** do `#smooth-wrapper`
2. Ajuste os estilos CSS em [src/resources/styles/custom/scroll-smoother.css](src/resources/styles/custom/scroll-smoother.css)

### Performance ruim

1. Reduza o valor de `smooth` (menor = menos suave, mais performance)
2. Desabilite `effects` se não estiver usando parallax
3. Defina `smoothTouch: 0` para desabilitar em mobile

## Referências

- [GSAP ScrollSmoother Docs](https://greensock.com/docs/v3/Plugins/ScrollSmoother)
- [GSAP ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
