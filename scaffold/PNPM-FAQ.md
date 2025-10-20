# FAQ: pnpm e node_modules

## ❓ Por que não vejo a pasta `node_modules/`?

**Resposta: Isso é NORMAL com pnpm!**

### Como o pnpm funciona:

Diferente do npm/yarn que copiam todos os pacotes para `node_modules/`, o pnpm:

1. **Armazena pacotes em um local central**: `~/.pnpm-store/`
2. **Cria links simbólicos** em vez de copiar arquivos
3. **A pasta real** fica em `node_modules/.pnpm/` (pasta oculta)

### Benefícios:

- ✅ **Economiza disco**: Pacotes compartilhados entre projetos
- ✅ **Instalação mais rápida**: Não precisa copiar tudo
- ✅ **Mais seguro**: Hoisting inteligente evita bugs

---

## 🔍 Como verificar se está instalado corretamente?

### 1. **Verificar pasta node_modules existe** (mesmo que vazia)

```bash
ls -la node_modules/

# Você deve ver:
# drwxr-xr-x  node_modules/
# .pnpm/  ← A pasta real (oculta)
# vite/   ← Links simbólicos
# etc...
```

### 2. **Verificar conteúdo da pasta .pnpm**

```bash
ls -la node_modules/.pnpm/ | head -10

# Você deve ver pacotes instalados
```

### 3. **Verificar que comandos funcionam**

```bash
# Build deve funcionar
pnpm build

# Vite deve estar acessível
pnpm vite --version

# Dev deve funcionar
pnpm dev
```

### 4. **Verificar pnpm-lock.yaml**

```bash
ls -la pnpm-lock.yaml

# Arquivo deve existir e ter tamanho > 0
wc -l pnpm-lock.yaml

# Deve ter milhares de linhas
```

---

## 🐛 Problemas Comuns

### ❌ "Cannot find module 'vite'"

**Causa:** pnpm não instalou corretamente

**Solução:**

```bash
# Limpar cache
pnpm store prune

# Remover node_modules e lock
rm -rf node_modules pnpm-lock.yaml

# Reinstalar
pnpm install
```

### ❌ "pnpm: command not found"

**Causa:** pnpm não está instalado

**Solução:**

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### ❌ `node_modules/` completamente vazio

**Causa:** Instalação falhou silenciosamente

**Solução:**

```bash
# Ver se houve erros
pnpm install --reporter=append-only

# Verificar permissões
ls -la ~/.pnpm-store/

# Se necessário, recriar store
rm -rf ~/.pnpm-store
pnpm install
```

---

## 📊 Comparação: npm vs pnpm

| Aspecto              | npm/yarn                               | pnpm                 |
| -------------------- | -------------------------------------- | -------------------- |
| **node_modules/**    | Pasta cheia de arquivos                | Pasta com symlinks   |
| **Tamanho**          | ~200-500MB                             | ~50-100MB            |
| **Localização real** | `./node_modules/`                      | `~/.pnpm-store/`     |
| **Instalação**       | Copia tudo                             | Faz links            |
| **Velocidade**       | Lento                                  | Rápido               |
| **Disco usado**      | 1 projeto = 500MB<br>10 projetos = 5GB | 10 projetos = ~600MB |

---

## ✅ Como saber se está tudo OK?

Execute este checklist:

```bash
# 1. node_modules existe?
[ -d "node_modules" ] && echo "✓ node_modules existe"

# 2. .pnpm existe dentro?
[ -d "node_modules/.pnpm" ] && echo "✓ .pnpm existe"

# 3. pnpm-lock.yaml existe?
[ -f "pnpm-lock.yaml" ] && echo "✓ pnpm-lock.yaml existe"

# 4. Vite está acessível?
pnpm vite --version && echo "✓ Vite funciona"

# 5. Build funciona?
pnpm build && echo "✓ Build funciona"
```

**Se todos retornarem ✓, está tudo certo!**

---

## 🔄 Migrar de npm para pnpm

Se você está acostumado com npm e quer entender melhor:

### Comandos equivalentes:

| npm                  | pnpm                             | Descrição        |
| -------------------- | -------------------------------- | ---------------- |
| `npm install`        | `pnpm install`                   | Instalar deps    |
| `npm install vite`   | `pnpm add vite`                  | Adicionar pacote |
| `npm uninstall vite` | `pnpm remove vite`               | Remover pacote   |
| `npm run dev`        | `pnpm dev`                       | Rodar script     |
| `npm ci`             | `pnpm install --frozen-lockfile` | Install CI       |

### Estrutura de node_modules:

**npm:**

```
node_modules/
├── vite/           ← Pasta real
│   ├── dist/
│   ├── package.json
│   └── ...
├── @vitejs/
│   └── plugin-react/
└── ...              ← Milhares de pastas
```

**pnpm:**

```
node_modules/
├── .pnpm/          ← Pasta real (symlinked de ~/.pnpm-store)
│   ├── vite@5.0.0/
│   ├── @vitejs+plugin-react@4.2.0/
│   └── ...
├── vite            ← Symlink → .pnpm/vite@5.0.0/node_modules/vite
└── @vitejs/
    └── plugin-react ← Symlink
```

---

## 💡 Dicas

### Ver tamanho real usado:

```bash
# Tamanho aparente (com symlinks)
du -sh node_modules/
# ~50MB

# Tamanho real no disco
du -sh ~/.pnpm-store/
# ~2GB (compartilhado entre TODOS os projetos)
```

### Limpar cache do pnpm:

```bash
# Ver quanto espaço está usando
pnpm store status

# Remover pacotes não usados
pnpm store prune
```

### Forçar flat node_modules (estilo npm):

Se REALMENTE precisa de `node_modules/` tradicional:

```bash
# Adicionar no package.json
{
  "pnpm": {
    "nodeLinker": "hoisted"
  }
}

# Reinstalar
rm -rf node_modules
pnpm install
```

**⚠️ Não recomendado!** Você perde os benefícios do pnpm.

---

## 🎓 Mais Informações

- [Documentação oficial do pnpm](https://pnpm.io/)
- [Por que pnpm?](https://pnpm.io/motivation)
- [Estrutura de node_modules](https://pnpm.io/symlinked-node-modules-structure)

---

## TL;DR

**É NORMAL não ver muitos arquivos em `node_modules/` com pnpm!**

Se `pnpm build` funciona, está tudo OK.

Os pacotes estão em `~/.pnpm-store/` e são linkados via symlinks.

**Benefícios:**

- 🚀 Mais rápido
- 💾 Economiza disco
- 🔒 Mais seguro

**Para verificar:**

```bash
pnpm build  # Se funcionar, está OK!
```
