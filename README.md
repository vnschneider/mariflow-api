# WhatsApp API - Zap API Venom

Uma API REST completa para integração com WhatsApp usando a biblioteca `whatsapp-web.js`. Desenvolvida com TypeScript, Express.js e documentação Swagger.

## 🚀 Características

- ✅ **API REST completa** para WhatsApp
- ✅ **TypeScript** para tipagem forte
- ✅ **Express.js** como framework web
- ✅ **Swagger/OpenAPI** para documentação interativa
- ✅ **Autenticação por API Key**
- ✅ **Rate Limiting** para proteção
- ✅ **Logging completo** com Winston
- ✅ **Validação de dados** com Joi
- ✅ **Upload de arquivos** com Multer
- ✅ **WebSocket** para eventos em tempo real
- ✅ **Tratamento de erros** robusto
- ✅ **Middleware de segurança** com Helmet
- ✅ **Compressão** de respostas
- ✅ **CORS** configurável

## 📋 Funcionalidades

### WhatsApp

- ✅ Inicialização e autenticação
- ✅ Geração de QR Code
- ✅ Status da sessão
- ✅ Logout e reinicialização
- ✅ Estatísticas do cliente

### Mensagens

- ✅ Envio de mensagens de texto
- ✅ Envio de mídia (imagens, vídeos, áudios, documentos)
- ✅ Obtenção de mensagens de um chat
- ✅ Reações a mensagens
- ✅ Encaminhamento de mensagens
- ✅ Exclusão de mensagens
- ✅ Favoritar/desfavoritar mensagens
- ✅ Download de mídia

### Contatos

- ✅ Listagem de contatos
- ✅ Informações de contato específico
- ✅ Foto de perfil
- ✅ Bloquear/desbloquear contatos
- ✅ Gerenciamento de chats (marcar como lido, silenciar, arquivar, fixar)
- ✅ Exclusão de chats

### Grupos

- ✅ Criação de grupos
- ✅ Listagem de grupos
- ✅ Informações de grupo específico
- ✅ Geração de links de convite
- ✅ Entrada em grupos via convite
- ✅ Gerenciamento de participantes (adicionar, remover, promover, rebaixar)
- ✅ Configurações de grupo (nome, descrição, permissões)
- ✅ Saída de grupos

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- Yarn 4.10.3+ (recomendado) ou npm
- WhatsApp Web instalado no navegador

### Passos

1. **Clone o repositório**

```bash
git clone https://github.com/FAB-PRO/zap-api-venom.git
cd zap-api-venom
```

2. **Instale as dependências com Yarn**

**Opção A: Instalação Automática (Recomendada)**

```bash
# Linux/macOS
./scripts/install.sh

# Windows
scripts\install.bat
```

**Opção B: Instalação Manual com Yarn Berry**

```bash
# Instalar Yarn globalmente (se não estiver instalado)
npm install -g yarn

# Configurar Yarn Berry no projeto
yarn set version berry

# Instalar dependências
yarn install
```

**Opção C: Com npm (alternativa)**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do WhatsApp
WHATSAPP_SESSION_PATH=./sessions
WHATSAPP_QR_TIMEOUT=60000
WHATSAPP_AUTH_STRATEGY=local

# Configurações de Segurança
API_KEY=your-secret-api-key-here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configurações de Log
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Configurações do Swagger
SWAGGER_TITLE=WhatsApp API
SWAGGER_DESCRIPTION=API REST para integração com WhatsApp
SWAGGER_VERSION=1.0.0
SWAGGER_HOST=localhost:3000

# Configurações de Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Configurações de Cache
CACHE_TTL=300000
```

4. **Compile o TypeScript**

```bash
yarn build
```

5. **Inicie o servidor**

```bash
yarn start
```

Para desenvolvimento:

```bash
yarn dev
```

## 📚 Documentação da API

Após iniciar o servidor, acesse a documentação interativa do Swagger:

- **Swagger UI**: http://localhost:3000/api-docs
- **JSON da API**: http://localhost:3000/api-docs.json

## 🔑 Autenticação

A API utiliza autenticação por API Key. Inclua a chave no header das requisições:

```bash
curl -H "X-API-Key: your-secret-api-key-here" \
     http://localhost:3000/api/v1/whatsapp/status
```

Ou via Authorization header:

```bash
curl -H "Authorization: Bearer your-secret-api-key-here" \
     http://localhost:3000/api/v1/whatsapp/status
```

## 🚀 Uso Básico

### 1. Verificar Status

```bash
curl -H "X-API-Key: your-secret-api-key-here" \
     http://localhost:3000/api/v1/whatsapp/status
```

### 2. Obter QR Code

```bash
curl -H "X-API-Key: your-secret-api-key-here" \
     http://localhost:3000/api/v1/whatsapp/qr
```

### 3. Enviar Mensagem

```bash
curl -X POST \
     -H "X-API-Key: your-secret-api-key-here" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "5511999999999@c.us",
       "message": "Olá! Esta é uma mensagem de teste."
     }' \
     http://localhost:3000/api/v1/messages/send
```

### 4. Enviar Mídia

```bash
curl -X POST \
     -H "X-API-Key: your-secret-api-key-here" \
     -F "to=5511999999999@c.us" \
     -F "caption=Legenda da imagem" \
     -F "file=@/path/to/image.jpg" \
     http://localhost:3000/api/v1/messages/send-media
```

### 5. Criar Grupo

```bash
curl -X POST \
     -H "X-API-Key: your-secret-api-key-here" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Meu Grupo",
       "participants": ["5511999999999@c.us", "5511888888888@c.us"],
       "description": "Descrição do grupo"
     }' \
     http://localhost:3000/api/v1/groups
```

## 🔌 WebSocket

A API também oferece eventos em tempo real via WebSocket:

```javascript
const io = require("socket.io-client");
const socket = io("http://localhost:3000");

socket.on("whatsapp:ready", (data) => {
  console.log("WhatsApp está pronto!", data);
});

socket.on("whatsapp:message", (message) => {
  console.log("Nova mensagem:", message);
});

socket.on("whatsapp:qr", (data) => {
  console.log("QR Code gerado:", data.qrCode);
});
```

## 📁 Estrutura do Projeto

```
src/
├── config/           # Configurações
│   ├── index.ts      # Configuração principal
│   └── swagger.ts    # Configuração do Swagger
├── controllers/      # Controladores
│   ├── WhatsAppController.ts
│   ├── MessageController.ts
│   ├── ContactController.ts
│   └── GroupController.ts
├── middleware/       # Middlewares
│   ├── auth.ts       # Autenticação
│   └── validation.ts # Validação
├── routes/           # Rotas
│   ├── whatsapp.ts
│   ├── messages.ts
│   ├── contacts.ts
│   └── groups.ts
├── services/         # Serviços
│   └── WhatsAppService.ts
├── types/            # Tipos TypeScript
│   └── index.ts
├── utils/            # Utilitários
│   └── logger.ts     # Sistema de logging
└── index.ts          # Arquivo principal
```

## 🧪 Testes

```bash
yarn test
```

Para testes em modo watch:

```bash
yarn test:watch
```

Para cobertura de testes:

```bash
yarn test:coverage
```

## 📝 Scripts Disponíveis

- `yarn build` - Compila o TypeScript
- `yarn start` - Inicia o servidor em produção
- `yarn dev` - Inicia o servidor em desenvolvimento
- `yarn test` - Executa os testes
- `yarn test:watch` - Executa os testes em modo watch
- `yarn test:coverage` - Executa os testes com cobertura
- `yarn lint` - Executa o linter
- `yarn lint:fix` - Corrige problemas do linter
- `yarn clean` - Remove arquivos de build

## 📦 Gerenciamento de Pacotes com Yarn

Este projeto está otimizado para usar Yarn como gestor de pacotes. Consulte o arquivo [YARN_SETUP.md](YARN_SETUP.md) para instruções detalhadas sobre configuração e uso do Yarn.

### Comandos Yarn Essenciais

```bash
# Instalação
yarn install                 # Instalar dependências
yarn add <package>           # Adicionar dependência
yarn add -D <package>        # Adicionar dependência de desenvolvimento

# Desenvolvimento
yarn dev                     # Modo desenvolvimento
yarn build                   # Compilar projeto
yarn start                   # Modo produção

# Testes e Qualidade
yarn test                    # Executar testes
yarn test:watch              # Testes em modo watch
yarn test:coverage           # Cobertura de testes
yarn lint                    # Verificar código
yarn lint:fix                # Corrigir problemas de lint

# Utilitários
yarn clean                   # Limpar arquivos de build
yarn outdated                # Verificar dependências desatualizadas
yarn audit                   # Verificar vulnerabilidades
```

### Vantagens do Yarn

- ⚡ **Instalação mais rápida** com cache inteligente
- 🔒 **Lock file determinístico** para builds reproduzíveis
- 🛡️ **Segurança aprimorada** com verificação de integridade
- 🔧 **Workspaces** para projetos monorepo
- 📦 **Plugins** para funcionalidades estendidas

## 🔧 Configuração Avançada

### Variáveis de Ambiente

| Variável                | Descrição                 | Padrão                     |
| ----------------------- | ------------------------- | -------------------------- |
| `PORT`                  | Porta do servidor         | `3000`                     |
| `NODE_ENV`              | Ambiente de execução      | `development`              |
| `API_KEY`               | Chave de API              | `your-secret-api-key-here` |
| `WHATSAPP_SESSION_PATH` | Caminho das sessões       | `./sessions`               |
| `LOG_LEVEL`             | Nível de log              | `info`                     |
| `MAX_FILE_SIZE`         | Tamanho máximo de arquivo | `10485760` (10MB)          |

### Rate Limiting

Por padrão, a API permite 100 requisições por 15 minutos por IP. Configure via variáveis de ambiente:

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100  # 100 requisições
```

### Upload de Arquivos

Tipos de arquivo permitidos:

- Imagens: JPEG, PNG, GIF, WebP
- Vídeos: MP4, AVI, MOV
- Áudios: MP3, WAV, OGG
- Documentos: PDF, DOC, DOCX, TXT

## 🚨 Limitações e Avisos

⚠️ **IMPORTANTE**: Esta API utiliza o WhatsApp Web, que pode ser bloqueado pelo WhatsApp. Use com responsabilidade e não abuse da API.

- WhatsApp não permite bots ou clientes não oficiais
- O risco de bloqueio existe
- Use apenas para fins legítimos
- Respeite os termos de uso do WhatsApp

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação da API](http://localhost:3000/api-docs)
2. Consulte os [issues](https://github.com/FAB-PRO/zap-api-venom/issues)
3. Crie um novo issue se necessário

## 🙏 Agradecimentos

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - Biblioteca principal
- [Express.js](https://expressjs.com/) - Framework web
- [Swagger](https://swagger.io/) - Documentação da API
- [TypeScript](https://www.typescriptlang.org/) - Linguagem de programação

---

Desenvolvido com ❤️ por [FAB-PRO](https://github.com/FAB-PRO)
