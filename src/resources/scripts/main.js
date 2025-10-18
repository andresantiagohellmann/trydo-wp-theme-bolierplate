import '../styles/main.css';

// Importar blocos DEPOIS do main.css para garantir ordem correta das layers
const blockStyles = import.meta.glob('@/blocks/**/style.css', { eager: true });

console.log('Olá Mundo!');
