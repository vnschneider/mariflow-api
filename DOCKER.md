# 🐳 Docker Setup - MariFlow API

Este guia explica como executar a MariFlow API usando Docker com porta configurável.

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado
- Porta disponível (padrão: 8080)

## 🚀 Início Rápido

### 1. Configuração Automática (Recomendado)

```bash
# Configura automaticamente e inicia o container
yarn docker:setup
```

Este comando irá:

- Copiar `env.docker.example` para `.env`
- Construir a imagem Docker
- Iniciar o container em background

### 2. Configuração Manual

#### Passo 1: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.docker.example .env

# Editar configurações (opcional)
nano .env
```

#### Passo 2: Construir e Executar

```bash
# Construir a imagem
yarn docker:build

# Ou usar docker-compose
yarn docker:up
```

## ⚙️ Configuração de Porta

### Alterar Porta Externa

Edite o arquivo `.env` e modifique a variável `PORT`:

```bash
# Para usar porta 8080 (padrão)
PORT=8080

# Para usar porta 3000
PORT=3000

# Para usar porta 9000
PORT=9000
```

### Exemplo de Uso

```bash
# Usar porta 8080
PORT=8080 yarn docker:up

# Usar porta 3000
PORT=3000 yarn docker:up
```

## 📊 Comandos Úteis

### Gerenciamento do Container

```bash
# Iniciar container
yarn docker:up

# Parar container
yarn docker:down

# Reiniciar container
yarn docker:restart

# Ver logs em tempo real
yarn docker:logs
```

### Build e Deploy

```bash
# Construir imagem
yarn docker:build

# Executar container diretamente
yarn docker:run

# Setup completo (primeira vez)
yarn docker:setup
```

## 🌐 Acessos

Após iniciar o container, a API estará disponível em:

- **API**: `http://localhost:${PORT}`
- **Documentação**: `http://localhost:${PORT}/api-docs`
- **Health Check**: `http://localhost:${PORT}/health`

### Exemplo com Porta 8080

- **API**: `http://localhost:8080`
- **Documentação**: `http://localhost:8080/api-docs`
- **Health Check**: `http://localhost:8080/health`

## 📁 Volumes Persistentes

O Docker Compose cria volumes para persistir dados:

- **Sessões WhatsApp**: `whatsapp_sessions`
- **Logs**: `app_logs`
- **Uploads**: `app_uploads`

## 🔧 Configurações Avançadas

### Variáveis de Ambiente Importantes

```bash
# Porta externa
PORT=8080

# Chave da API (ALTERE!)
API_KEY=mariflow-super-secret-api-key-2024

# Ambiente
NODE_ENV=production

# Host do Swagger
SWAGGER_HOST=localhost:8080
```

### Personalizar Docker Compose

Edite o arquivo `docker-compose.yml` para:

- Alterar configurações de rede
- Adicionar volumes extras
- Configurar recursos (CPU/Memória)
- Adicionar serviços extras

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
yarn docker:logs

# Verificar status
docker-compose ps

# Reconstruir imagem
docker-compose up -d --build
```

### Porta já em uso

```bash
# Verificar portas em uso
netstat -tulpn | grep :8080

# Usar porta diferente
PORT=9000 yarn docker:up
```

### Problemas de Permissão

```bash
# Verificar permissões dos volumes
docker volume ls
docker volume inspect mariflow-api_whatsapp_sessions
```

## 📝 Logs

### Ver Logs da Aplicação

```bash
# Logs em tempo real
yarn docker:logs

# Logs específicos
docker-compose logs mariflow-api

# Últimas 100 linhas
docker-compose logs --tail=100 mariflow-api
```

### Logs do Sistema

```bash
# Logs do Docker
docker system logs

# Informações do container
docker inspect mariflow-api
```

## 🔄 Atualizações

### Atualizar Código

```bash
# Parar container
yarn docker:down

# Reconstruir com novo código
yarn docker:up --build
```

### Atualizar Dependências

```bash
# Reconstruir imagem completa
docker-compose build --no-cache

# Reiniciar
yarn docker:restart
```

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs: `yarn docker:logs`
2. Consulte a documentação da API: `http://localhost:${PORT}/api-docs`
3. Verifique o health check: `http://localhost:${PORT}/health`

---

**Desenvolvido por Vinícius Schneider (@vnschneider)**
