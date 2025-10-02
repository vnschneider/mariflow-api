@echo off
setlocal enabledelayedexpansion

REM Script de instalação para Zap API Venom (Windows)
REM Este script configura o ambiente de desenvolvimento

echo.
echo ================================
echo   Zap API Venom - Instalação
echo ================================
echo.

REM Verificar se Node.js está instalado
echo [INFO] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js não está instalado. Por favor, instale Node.js 18+ primeiro.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [INFO] Node.js %NODE_VERSION% encontrado ✓
echo.

REM Verificar se Yarn está instalado
echo [INFO] Verificando Yarn...
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Yarn não está instalado. Instalando...
    npm install -g yarn
    if %errorlevel% neq 0 (
        echo [ERROR] Falha ao instalar Yarn
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('yarn --version') do set YARN_VERSION=%%i
echo [INFO] Yarn %YARN_VERSION% encontrado ✓

REM Configurar Yarn Berry
echo [INFO] Configurando Yarn Berry...
yarn set version berry
if %errorlevel% neq 0 (
    echo [ERROR] Falha ao configurar Yarn Berry
    pause
    exit /b 1
)
echo [INFO] Yarn Berry configurado ✓
echo.

REM Criar diretórios necessários
echo [INFO] Criando diretórios...
if not exist "logs" mkdir logs
if not exist "sessions" mkdir sessions
if not exist "uploads" mkdir uploads
echo [INFO] Diretórios criados ✓
echo.

REM Instalar dependências
echo [INFO] Instalando dependências...
yarn install
if %errorlevel% neq 0 (
    echo [ERROR] Falha ao instalar dependências
    pause
    exit /b 1
)
echo [INFO] Dependências instaladas com sucesso ✓
echo.

REM Configurar variáveis de ambiente
echo [INFO] Configurando variáveis de ambiente...
if not exist ".env" (
    copy "env.example" ".env" >nul
    echo [INFO] Arquivo .env criado ✓
    echo [WARNING] Por favor, edite o arquivo .env com suas configurações
) else (
    echo [INFO] Arquivo .env já existe ✓
)
echo.

REM Compilar projeto
echo [INFO] Compilando projeto...
yarn build
if %errorlevel% neq 0 (
    echo [ERROR] Falha ao compilar o projeto
    pause
    exit /b 1
)
echo [INFO] Projeto compilado com sucesso ✓
echo.

REM Executar testes
echo [INFO] Executando testes...
yarn test
if %errorlevel% neq 0 (
    echo [WARNING] Alguns testes falharam, mas continuando...
) else (
    echo [INFO] Testes executados com sucesso ✓
)
echo.

REM Verificar linting
echo [INFO] Verificando linting...
yarn lint
if %errorlevel% neq 0 (
    echo [WARNING] Problemas de linting encontrados
    echo [INFO] Execute 'yarn lint:fix' para corrigir automaticamente
) else (
    echo [INFO] Linting passou ✓
)
echo.

REM Mostrar informações finais
echo ================================
echo   Instalação Concluída!
echo ================================
echo.
echo ✅ Zap API Venom configurado com sucesso!
echo.
echo Comandos úteis:
echo   yarn dev          - Iniciar em modo desenvolvimento
echo   yarn start        - Iniciar em modo produção
echo   yarn test         - Executar testes
echo   yarn lint         - Verificar código
echo   yarn build        - Compilar projeto
echo.
echo Próximos passos:
echo   1. Edite o arquivo .env com suas configurações
echo   2. Execute 'yarn dev' para iniciar o servidor
echo   3. Acesse http://localhost:3000/api-docs para ver a documentação
echo.
echo ⚠️  Importante:
echo   - Configure sua API_KEY no arquivo .env
echo   - O WhatsApp Web será aberto para autenticação
echo   - Escaneie o QR Code com seu WhatsApp
echo.
pause
