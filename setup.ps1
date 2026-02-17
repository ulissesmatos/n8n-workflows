# Script de Setup Automático para Windows
# Execute este script no PowerShell: .\setup.ps1

Write-Host "🚀 Iniciando setup do n8n Workflow Library..." -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ de https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar PostgreSQL
Write-Host "Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Host "✅ PostgreSQL instalado" -ForegroundColor Green
    } else {
        Write-Host "⚠️ PostgreSQL não detectado. Por favor, instale de https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ PostgreSQL não detectado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies instaladas" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Cyan
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies instaladas" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "⚙️ Configurando arquivos de ambiente..." -ForegroundColor Cyan

# Backend .env
$backendEnvPath = "backend\.env"
if (-not (Test-Path $backendEnvPath)) {
    Write-Host "Criando backend\.env..." -ForegroundColor Yellow
    
    # Gerar JWT secret aleatório
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    # Solicitar senha do PostgreSQL
    Write-Host ""
    $pgPassword = Read-Host "Digite a senha do PostgreSQL (usuário 'postgres')"
    
    $backendEnv = @"
NODE_ENV=development
PORT=3000

# Database URL
DATABASE_URL="postgresql://postgres:$pgPassword@localhost:5432/n8n_workflow_library?schema=public"

# JWT Secret
JWT_SECRET=$jwtSecret

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Default Admin User
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=Admin123!@#
"@
    
    $backendEnv | Out-File -FilePath $backendEnvPath -Encoding UTF8
    Write-Host "✅ backend\.env criado" -ForegroundColor Green
} else {
    Write-Host "⏭️ backend\.env já existe, pulando..." -ForegroundColor Yellow
}

# Frontend .env
$frontendEnvPath = "frontend\.env"
if (-not (Test-Path $frontendEnvPath)) {
    Write-Host "Criando frontend\.env..." -ForegroundColor Yellow
    $frontendEnv = @"
VITE_API_URL=http://localhost:3000/api
"@
    $frontendEnv | Out-File -FilePath $frontendEnvPath -Encoding UTF8
    Write-Host "✅ frontend\.env criado" -ForegroundColor Green
} else {
    Write-Host "⏭️ frontend\.env já existe, pulando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🗄️ Configurando banco de dados..." -ForegroundColor Cyan
Set-Location backend

Write-Host "Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client gerado" -ForegroundColor Green

Write-Host ""
Write-Host "Executando migrations do banco de dados..." -ForegroundColor Yellow
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao executar migrations. Verifique se o PostgreSQL está rodando e as credenciais estão corretas." -ForegroundColor Red
    Write-Host "   Você pode executar manualmente: cd backend && npx prisma migrate dev" -ForegroundColor Yellow
} else {
    Write-Host "✅ Migrations executadas com sucesso" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "✨ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o projeto:" -ForegroundColor Cyan
Write-Host "1. Backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Acesse: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Admin: http://localhost:5173/login" -ForegroundColor Cyan
Write-Host "   Email: admin@example.com" -ForegroundColor White
Write-Host "   Senha: Admin123!@#" -ForegroundColor White
Write-Host ""
Write-Host "Consulte SETUP.md para mais informações." -ForegroundColor Yellow
