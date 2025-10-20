# Theme Scaffolding

Sistema de clonagem do boilerplate Trydo para novos projetos usando Plop.js.

## 🚀 Uso Rápido

```bash
pnpm scaffold
```

O comando fará perguntas interativas e gerará um novo tema em `godev/{seu-slug}/`.

## 📋 Prompts

O scaffold perguntará:

1. **Theme slug** (kebab-case): `my-awesome-theme`
    - Usado para: diretórios, text domain, package name

2. **Theme name**: `My Awesome Theme`
    - Usado para: header do tema, títulos

3. **PHP prefix** (snake_case): `my_awesome_theme`
    - Usado para: namespaces de funções PHP, constantes

4. **Author name**: `Seu Nome / Empresa`

5. **Author URI**: `https://seu-site.com`

6. **Theme URI**: (opcional, default = Author URI)

7. **Descrição**: Breve descrição do tema

8. **Versão inicial**: `0.1.0` (ou sua preferência)

9. **Block category title**: `My Blocks`
    - Nome da categoria no editor de blocos

10. **Block category slug**: `my-blocks`

11. **Gerar .env.example?**: `Yes`/`No`
    - Se sim, pergunta host e porta do Vite

12. **Diretório de saída**: `godev/my-theme`
    - Caminho relativo ao boilerplate

13. **Executar pnpm install?**: `No` (recomendado)
    - Instalar dependências automaticamente

## 📦 O que é Copiado

### ✅ Incluído no tema gerado:

- `src/` - Todo código fonte (blocks, inc, parts, resources, templates)
- `package.json` - Atualizado com novo nome/versão
- `composer.json` - Atualizado
- `vite.config.js` - Configuração do Vite
- `tsconfig.json` - Configuração TypeScript
- `.editorconfig`, `.prettierrc.cjs`, etc - Ferramentas de dev
- `.env.example` - Se solicitado
- `README.md` - Gerado automaticamente
- `docs/ARCHITECTURE.md` - Documentação básica

### ❌ Excluído do tema gerado:

- `node_modules/` - Precisa rodar `pnpm install`
- `dist/` - Será gerado no primeiro build
- `production/` - Será gerado com `pnpm production`
- `godev/` - Pasta onde temas ficam
- `scaffold/` - Sistema de scaffolding (só no boilerplate)
- `.git/` - Histórico git do boilerplate
- `pnpm-lock.yaml` - Será gerado no install

## 🔄 Substituições Automáticas

O scaffold substitui automaticamente em **todos os arquivos**:

| Original                     | Substituído Por        | Onde                      |
| ---------------------------- | ---------------------- | ------------------------- |
| `trydo-wp-theme-bolierplate` | `{seu-slug}`           | Nomes, slugs, text domain |
| `trydo_wp_theme_bolierplate` | `{seu_namespace}`      | Funções PHP               |
| `TRYDO_WP_THEME_BOLIERPLATE` | `{SEU_NAMESPACE}`      | Constantes PHP            |
| `Trydo WP Theme Bolierplate` | `{Seu Título}`         | Títulos, headers          |
| `Trydo Blocks`               | `{Sua Categoria}`      | Categoria de blocos       |
| `trydo-blocks`               | `{seu-slug-categoria}` | Slug da categoria         |

Extensões processadas: `.php`, `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.css`, `.scss`, `.md`, `.html`, `.xml`

## 📁 Estrutura do Tema Gerado

```
godev/my-awesome-theme/
├── src/
│   ├── blocks/          # Blocos customizados
│   ├── inc/             # Helpers PHP
│   ├── parts/           # Template parts
│   ├── resources/       # Scripts, estilos, fontes
│   ├── templates/       # Templates FSE
│   ├── functions.php    # Bootstrap
│   ├── style.css        # Header do tema (gerado)
│   └── theme.json       # Configuração
├── package.json         # Atualizado
├── composer.json        # Atualizado
├── vite.config.js
├── README.md            # Gerado
├── .env.example         # Opcional
└── docs/
    └── ARCHITECTURE.md  # Documentação
```

## 🎯 Próximos Passos (após scaffold)

```bash
# 1. Entrar no tema gerado
cd godev/my-awesome-theme

# 2. Instalar dependências
pnpm install

# 3. Iniciar desenvolvimento
pnpm dev

# 4. (Opcional) Configurar git
git init
git add .
git commit -m "Initial commit from Trydo boilerplate"
git remote add origin <seu-repo>
git push -u origin main

# 5. (Opcional) Atualizar screenshot.png
# Substitua por uma imagem 1200x900px do seu tema
```

## 🧪 Validação

Veja [TESTING.md](./TESTING.md) para checklist completo de validação.

### Teste Rápido

```bash
cd godev/my-awesome-theme

# Verificar que substituições funcionaram
grep "my-awesome-theme" src/style.css
grep "my_awesome_theme" src/functions.php

# Verificar que tema funciona
pnpm install
pnpm dev
```

## 🔧 Arquivos do Sistema

- `plopfile.cjs` - Configuração do Plop (prompts, substituições, ações)
- `test-scaffold.sh` - Script de teste automatizado
- `TESTING.md` - Guia de validação manual
- `README.md` - Este arquivo

## 💡 Dicas

### Múltiplos Temas

```bash
# Tema 1
pnpm scaffold
# → godev/client-a

# Tema 2
pnpm scaffold
# → godev/client-b
```

### Customizar Diretório de Saída

No prompt "Diretório de saída", você pode usar:

- `godev/meu-tema` - Padrão
- `../temas-clientes/novo-projeto` - Fora do boilerplate
- `~/Sites/meu-tema` - Path absoluto

### Refazer Scaffold

Se errou alguma configuração:

```bash
rm -rf godev/nome-errado
pnpm scaffold
# Preencha novamente
```

## 🐛 Troubleshooting

### "Destino já existe"

```bash
rm -rf godev/nome-do-tema
pnpm scaffold
```

### "no such file or directory"

Verifique que você está na raiz do boilerplate:

```bash
pwd
# Deve mostrar: .../trydo-wp-theme-bolierplate

ls -la src/
# Deve listar: blocks/, inc/, parts/, etc
```

### Tema gerado não funciona

```bash
cd godev/seu-tema
rm -rf node_modules
pnpm install
pnpm build
```

## 📚 Documentação Adicional

- [TESTING.md](./TESTING.md) - Guia de validação
- [../docs/development-journal.md](../docs/development-journal.md) - Arquitetura do boilerplate

---

**Criado com ❤️ pela equipe Trydo**
