#!/bin/bash

# Script de instalação para Zap API Venom
# Este script configura o ambiente de desenvolvimento

set -e

echo "🚀 Configurando Zap API Venom..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar se Node.js está instalado
check_node() {
    print_header "Verificando Node.js"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado. Por favor, instale Node.js 18+ primeiro."
        echo "Download: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        print_message "Node.js $NODE_VERSION encontrado ✓"
    else
        print_error "Node.js $NODE_VERSION encontrado, mas versão 18+ é necessária"
        exit 1
    fi
}

# Verificar se Yarn está instalado
check_yarn() {
    print_header "Verificando Yarn"
    
    if ! command -v yarn &> /dev/null; then
        print_warning "Yarn não está instalado. Instalando..."
        
        # Tentar instalar com corepack primeiro
        if command -v corepack &> /dev/null; then
            print_message "Instalando Yarn com Corepack..."
            corepack enable
            corepack prepare yarn@stable --activate
        else
            print_message "Instalando Yarn globalmente..."
            npm install -g yarn
        fi
    fi
    
    YARN_VERSION=$(yarn --version)
    print_message "Yarn $YARN_VERSION encontrado ✓"
    
    # Configurar Yarn Berry
    print_message "Configurando Yarn Berry..."
    yarn set version berry
    print_message "Yarn Berry configurado ✓"
}

# Instalar dependências
install_dependencies() {
    print_header "Instalando Dependências"
    
    print_message "Instalando dependências com Yarn..."
    yarn install
    
    if [ $? -eq 0 ]; then
        print_message "Dependências instaladas com sucesso ✓"
    else
        print_error "Falha ao instalar dependências"
        exit 1
    fi
}

# Configurar variáveis de ambiente
setup_env() {
    print_header "Configurando Variáveis de Ambiente"
    
    if [ ! -f .env ]; then
        print_message "Criando arquivo .env..."
        cp env.example .env
        print_message "Arquivo .env criado ✓"
        print_warning "Por favor, edite o arquivo .env com suas configurações"
    else
        print_message "Arquivo .env já existe ✓"
    fi
}

# Compilar TypeScript
build_project() {
    print_header "Compilando Projeto"
    
    print_message "Compilando TypeScript..."
    yarn build
    
    if [ $? -eq 0 ]; then
        print_message "Projeto compilado com sucesso ✓"
    else
        print_error "Falha ao compilar o projeto"
        exit 1
    fi
}

# Executar testes
run_tests() {
    print_header "Executando Testes"
    
    print_message "Executando testes..."
    yarn test
    
    if [ $? -eq 0 ]; then
        print_message "Testes executados com sucesso ✓"
    else
        print_warning "Alguns testes falharam, mas continuando..."
    fi
}

# Verificar linting
check_lint() {
    print_header "Verificando Linting"
    
    print_message "Executando linter..."
    yarn lint
    
    if [ $? -eq 0 ]; then
        print_message "Linting passou ✓"
    else
        print_warning "Problemas de linting encontrados"
        print_message "Execute 'yarn lint:fix' para corrigir automaticamente"
    fi
}

# Criar diretórios necessários
create_directories() {
    print_header "Criando Diretórios"
    
    mkdir -p logs
    mkdir -p sessions
    mkdir -p uploads
    
    print_message "Diretórios criados ✓"
}

# Mostrar informações finais
show_final_info() {
    print_header "Instalação Concluída!"
    
    echo -e "${GREEN}✅ Zap API Venom configurado com sucesso!${NC}"
    echo ""
    echo -e "${BLUE}Comandos úteis:${NC}"
    echo "  yarn dev          - Iniciar em modo desenvolvimento"
    echo "  yarn start        - Iniciar em modo produção"
    echo "  yarn test         - Executar testes"
    echo "  yarn lint         - Verificar código"
    echo "  yarn build        - Compilar projeto"
    echo ""
    echo -e "${BLUE}Próximos passos:${NC}"
    echo "  1. Edite o arquivo .env com suas configurações"
    echo "  2. Execute 'yarn dev' para iniciar o servidor"
    echo "  3. Acesse http://localhost:3000/api-docs para ver a documentação"
    echo ""
    echo -e "${YELLOW}⚠️  Importante:${NC}"
    echo "  - Configure sua API_KEY no arquivo .env"
    echo "  - O WhatsApp Web será aberto para autenticação"
    echo "  - Escaneie o QR Code com seu WhatsApp"
    echo ""
}

# Função principal
main() {
    print_header "Zap API Venom - Instalação"
    
    check_node
    check_yarn
    create_directories
    install_dependencies
    setup_env
    build_project
    run_tests
    check_lint
    show_final_info
}

# Executar script
main "$@"
