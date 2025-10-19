import '../styles/main.css';

// Importar blocos DEPOIS do main.css para garantir ordem correta das layers
import.meta.glob('@/blocks/**/style.css', { eager: true });

// Initialize ScrollSmoother for smooth scrolling (front-end only)
import './scroll-smoother.js';
