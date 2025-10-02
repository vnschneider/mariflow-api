# Yarn Setup - Zap API Venom

Este documento explica como configurar e usar o Yarn Berry (v4.10.3+) como gestor de pacotes no projeto Zap API Venom.

## 📦 Sobre o Yarn Berry

O Yarn Berry é a versão mais recente do Yarn, um gestor de pacotes rápido, confiável e seguro para JavaScript. Ele oferece várias vantagens:

- **Performance**: Instalação mais rápida de pacotes
- **Segurança**: Verificação de integridade dos pacotes
- **Determinismo**: Lock file que garante builds reproduzíveis
- **Workspaces**: Suporte nativo para monorepos
- **Plugins**: Sistema extensível de plugins
- **Plug'n'Play**: Instalação sem node_modules (opcional)

## 🚀 Instalação do Yarn Berry

### Opção 1: Instalação Automática (Recomendada)

Execute o script de instalação que já configura o Yarn Berry automaticamente:

```bash
# Linux/macOS
chmod +x scripts/install.sh
./scripts/install.sh

# Windows
scripts\install.bat
```

### Opção 2: Instalação Manual

#### 1. Instalar Yarn Globalmente

```bash
npm install -g yarn
```

#### 2. Configurar Yarn Berry

```bash
yarn set version berry
```

#### 3. Verificar Instalação

```bash
yarn --version
# Deve mostrar: 4.10.3
```

## 🔧 Configuração do Projeto

### 1. Arquivo de Configuração

O projeto já está configurado com o arquivo `.yarnrc.yml`:

```yaml
yarnPath: .yarn/releases/yarn-4.10.3.cjs
nodeLinker: node-modules
```

### 2. Instalar Dependências

```bash
yarn install
```

### 3. Verificar Configuração

```bash
yarn --version
yarn config get nodeLinker
```

## 📋 Comandos Essenciais

### Instalação de Pacotes

```bash
# Instalar dependência de produção
yarn add <package-name>

# Instalar dependência de desenvolvimento
yarn add -D <package-name>

# Instalar dependência global
yarn global add <package-name>

# Instalar todas as dependências
yarn install
```

### Gerenciamento de Dependências

```bash
# Remover dependência
yarn remove <package-name>

# Atualizar dependências
yarn upgrade

# Atualizar dependência específica
yarn upgrade <package-name>

# Verificar dependências desatualizadas
yarn outdated
```

### Scripts do Projeto

```bash
# Desenvolvimento
yarn dev

# Build
yarn build

# Produção
yarn start

# Testes
yarn test
yarn test:watch
yarn test:coverage

# Linting
yarn lint
yarn lint:fix
```

### Utilitários

```bash
# Limpar cache
yarn cache clean

# Verificar integridade
yarn check

# Informações do projeto
yarn info

# Listar dependências
yarn list
```

## 🏗️ Yarn Berry (v4.10.3+)

### Características

- **Plugins**: Sistema extensível
- **Workspaces**: Suporte nativo para monorepos
- **Pnp**: Plug'n'Play (opcional)
- **Constraints**: Regras de dependências
- **Release**: Gerenciamento de versões

### Configuração Avançada

```yaml
# .yarnrc.yml
yarnPath: .yarn/releases/yarn-4.10.3.cjs
nodeLinker: node-modules

plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs
    spec: "@yarnpkg/plugin-workspace-tools"

packageExtensions:
  "whatsapp-web.js@*":
    peerDependencies:
      "puppeteer": "*"
```

### Comandos Específicos

```bash
# Configurar versão
yarn set version berry

# Adicionar plugin
yarn plugin import <plugin-name>

# Workspaces
yarn workspaces list
yarn workspace <workspace-name> <command>

# Constraints
yarn constraints
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Erro de Permissão

```bash
# Linux/macOS
sudo chown -R $(whoami) ~/.yarn
sudo chown -R $(whoami) ~/.cache/yarn

# Windows (como administrador)
yarn cache clean
```

#### 2. Cache Corrompido

```bash
yarn cache clean
yarn install
```

#### 3. Lock File Conflitos

```bash
rm yarn.lock
yarn install
```

#### 4. Dependências Desatualizadas

```bash
yarn upgrade-interactive
```

### Logs e Debug

```bash
# Verbose
yarn install --verbose

# Debug
yarn install --debug

# Logs
yarn config get registry
yarn config get cacheFolder
```

## 📚 Recursos Adicionais

- [Documentação Oficial do Yarn](https://yarnpkg.com/getting-started)
- [Yarn Berry Guide](https://yarnpkg.com/features/berry)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
- [Yarn Plugins](https://yarnpkg.com/features/plugins)

## 🤝 Contribuição

Se você encontrar problemas com a configuração do Yarn ou tiver sugestões de melhoria, por favor:

1. Abra uma issue no repositório
2. Descreva o problema detalhadamente
3. Inclua logs e informações do sistema
4. Proponha soluções se possível

---

**Nota**: Este projeto está configurado para usar Yarn Berry v4.10.3+ como gestor de pacotes principal. O uso do npm é suportado, mas pode resultar em comportamentos inesperados.
