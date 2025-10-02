# Use Node.js 18 LTS como base
FROM node:18-alpine AS base

# Instalar dependências necessárias para puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para usar o Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Instalar dependências
RUN yarn install --frozen-lockfile

# Stage de build
FROM base AS build

# Copiar código fonte
COPY . .

# Build da aplicação
RUN yarn build

# Stage de produção
FROM node:18-alpine AS production

# Instalar dependências necessárias para puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Criar diretórios necessários
RUN mkdir -p /app/logs /app/sessions /app/uploads && \
    chown -R nodejs:nodejs /app

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Instalar apenas dependências de produção + ts-node-dev para runtime
RUN yarn workspaces focus --production && \
    yarn add ts-node-dev tsconfig-paths && \
    yarn cache clean

# Copiar código fonte e compilado
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/tsconfig.json ./tsconfig.json

# Copiar arquivos de configuração
COPY --chown=nodejs:nodejs env.example .env

# Mudar para usuário não-root
USER nodejs

# Expor porta (será sobrescrita pelo docker-compose)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "-r", "tsconfig-paths/register", "src/index.ts"]
