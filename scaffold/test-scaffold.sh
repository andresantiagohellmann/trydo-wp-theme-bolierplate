#!/bin/bash
set -e

echo "🧪 Testando scaffold do tema..."
echo ""

# Limpar teste anterior
rm -rf godev/test-theme 2>/dev/null || true

# Inputs para o scaffold
cat << 'EOF' | pnpm scaffold
test-theme
Test Theme
test_theme
Test Author
https://test.com
https://test.com
Test theme description
0.1.0
Test Blocks
test-blocks
y
127.0.0.1
5173
godev/test-theme
n
EOF

echo ""
echo "✅ Scaffold executado!"
echo ""
echo "📋 Validando estrutura gerada..."

# Validações
THEME_DIR="godev/test-theme"

# 1. Verificar estrutura de diretórios
echo -n "   ✓ Estrutura de diretórios... "
[ -d "$THEME_DIR/src" ] || { echo "❌ FALHOU: src/ não existe"; exit 1; }
[ -d "$THEME_DIR/src/blocks" ] || { echo "❌ FALHOU: src/blocks/ não existe"; exit 1; }
[ -d "$THEME_DIR/src/inc" ] || { echo "❌ FALHOU: src/inc/ não existe"; exit 1; }
echo "✓"

# 2. Verificar arquivos essenciais
echo -n "   ✓ Arquivos essenciais... "
[ -f "$THEME_DIR/src/style.css" ] || { echo "❌ FALHOU: src/style.css não existe"; exit 1; }
[ -f "$THEME_DIR/src/theme.json" ] || { echo "❌ FALHOU: src/theme.json não existe"; exit 1; }
[ -f "$THEME_DIR/src/functions.php" ] || { echo "❌ FALHOU: src/functions.php não existe"; exit 1; }
[ -f "$THEME_DIR/package.json" ] || { echo "❌ FALHOU: package.json não existe"; exit 1; }
[ -f "$THEME_DIR/README.md" ] || { echo "❌ FALHOU: README.md não existe"; exit 1; }
echo "✓"

# 3. Verificar conteúdo de src/style.css
echo -n "   ✓ Header de src/style.css... "
grep -q "Theme Name: Test Theme" "$THEME_DIR/src/style.css" || { echo "❌ FALHOU"; exit 1; }
grep -q "Text Domain: test-theme" "$THEME_DIR/src/style.css" || { echo "❌ FALHOU"; exit 1; }
echo "✓"

# 4. Verificar substituições em src/functions.php
echo -n "   ✓ Substituições PHP... "
grep -q "test_theme_" "$THEME_DIR/src/functions.php" || { echo "❌ FALHOU: namespace não foi substituído"; exit 1; }
! grep -q "trydo_wp_theme_bolierplate" "$THEME_DIR/src/functions.php" || { echo "❌ FALHOU: ainda contém nome antigo"; exit 1; }
echo "✓"

# 5. Verificar package.json
echo -n "   ✓ package.json atualizado... "
grep -q '"name": "test-theme"' "$THEME_DIR/package.json" || { echo "❌ FALHOU"; exit 1; }
grep -q '"version": "0.1.0"' "$THEME_DIR/package.json" || { echo "❌ FALHOU"; exit 1; }
echo "✓"

# 6. Verificar src/theme.json
echo -n "   ✓ src/theme.json atualizado... "
grep -q '"version": "0.1.0"' "$THEME_DIR/src/theme.json" || { echo "❌ FALHOU"; exit 1; }
echo "✓"

# 7. Verificar que scaffold/ não foi copiado
echo -n "   ✓ scaffold/ excluído... "
[ ! -d "$THEME_DIR/scaffold" ] || { echo "❌ FALHOU: scaffold/ foi copiado"; exit 1; }
echo "✓"

# 8. Verificar que production/ não foi copiado
echo -n "   ✓ production/ excluído... "
[ ! -d "$THEME_DIR/production" ] || { echo "❌ FALHOU: production/ foi copiado"; exit 1; }
echo "✓"

# 9. Verificar .env.example
echo -n "   ✓ .env.example criado... "
[ -f "$THEME_DIR/.env.example" ] || { echo "❌ FALHOU"; exit 1; }
grep -q "WP_VITE_HOST=127.0.0.1" "$THEME_DIR/.env.example" || { echo "❌ FALHOU"; exit 1; }
echo "✓"

echo ""
echo "✅ Todos os testes passaram!"
echo ""
echo "📁 Tema de teste criado em: $THEME_DIR"
echo ""
echo "🧹 Para limpar: rm -rf $THEME_DIR"
