#!/bin/bash

# Script para validar se um tema gerado está OK
# Uso: ./validate-theme.sh /path/to/tema

THEME_DIR="${1:-.}"

echo "🔍 Validando tema em: $THEME_DIR"
echo ""

cd "$THEME_DIR" || exit 1

ERRORS=0

# 1. Verificar pnpm-lock.yaml
echo -n "📦 pnpm-lock.yaml... "
if [ -f "pnpm-lock.yaml" ]; then
    LINES=$(wc -l < pnpm-lock.yaml)
    if [ "$LINES" -gt 100 ]; then
        echo "✅ ($LINES linhas)"
    else
        echo "⚠️  Arquivo muito pequeno ($LINES linhas)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "❌ Não encontrado"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verificar node_modules
echo -n "📁 node_modules/... "
if [ -d "node_modules" ]; then
    if [ -d "node_modules/.pnpm" ]; then
        echo "✅ (pnpm symlinks)"
    else
        echo "⚠️  Existe mas sem .pnpm/"
    fi
else
    echo "❌ Não encontrado - execute: pnpm install"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verificar que comandos funcionam
echo -n "⚡ pnpm scripts... "
if command -v pnpm &> /dev/null; then
    if pnpm vite --version &> /dev/null; then
        echo "✅ (Vite acessível)"
    else
        echo "❌ Vite não funciona"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "❌ pnpm não instalado"
    ERRORS=$((ERRORS + 1))
fi

# 4. Verificar estrutura src/
echo -n "📂 Estrutura src/... "
REQUIRED_DIRS=("src/blocks" "src/inc" "src/parts" "src/resources")
MISSING_DIRS=()

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        MISSING_DIRS+=("$dir")
    fi
done

if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
    echo "✅"
else
    echo "❌ Faltando: ${MISSING_DIRS[*]}"
    ERRORS=$((ERRORS + 1))
fi

# 5. Verificar arquivos essenciais
echo -n "📄 Arquivos essenciais... "
REQUIRED_FILES=("src/style.css" "src/theme.json" "src/functions.php" "package.json")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅"
else
    echo "❌ Faltando: ${MISSING_FILES[*]}"
    ERRORS=$((ERRORS + 1))
fi

# 6. Verificar que NÃO contém scaffold/
echo -n "🗑️  Limpeza scaffold/... "
if [ ! -d "scaffold" ]; then
    echo "✅ (excluído)"
else
    echo "⚠️  scaffold/ ainda presente"
    ERRORS=$((ERRORS + 1))
fi

# 7. Testar build (opcional, só se node_modules existir)
if [ -d "node_modules" ]; then
    echo ""
    echo "🏗️  Testando build..."
    if pnpm build &> /tmp/build-test.log; then
        echo "   ✅ Build funcionou!"

        # Verificar que dist/ foi criado
        if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
            echo "   ✅ dist/ criado com assets"
        else
            echo "   ❌ dist/ vazio ou não existe"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo "   ❌ Build falhou! Ver: /tmp/build-test.log"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Resultado final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Tema válido e funcionando!"
    echo ""
    echo "🚀 Próximos passos:"
    echo "   pnpm dev    # Iniciar desenvolvimento"
    echo "   pnpm production  # Gerar ZIP"
else
    echo "❌ Encontrados $ERRORS problema(s)"
    echo ""
    echo "🔧 Ações sugeridas:"
    [ ! -d "node_modules" ] && echo "   pnpm install"
    [ $ERRORS -gt 1 ] && echo "   Verifique os erros acima"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
