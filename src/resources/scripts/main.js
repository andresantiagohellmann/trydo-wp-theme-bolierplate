import '../styles/main.css';

// Importar blocos DEPOIS do main.css para garantir ordem correta das layers
import.meta.glob('@/blocks/**/style.css', { eager: true });

// Initialize Phosphor Icons (icon fonts)
// Import all weights - you can comment out weights you don't need
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/light';
import '@phosphor-icons/web/thin';
import '@phosphor-icons/web/fill';
import '@phosphor-icons/web/duotone';

// Initialize ScrollSmoother for smooth scrolling (front-end only)
import './scroll-smoother.js';
