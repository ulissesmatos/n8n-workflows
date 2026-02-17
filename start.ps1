# Script para iniciar Backend e Frontend simultaneamente
# Execute este script: .\start.ps1

Write-Host "🚀 Iniciando n8n Workflow Library..." -ForegroundColor Cyan
Write-Host ""

# Verificar e iniciar PostgreSQL com tratamento de erros
Write-Host "🐘 Verificando PostgreSQL..." -ForegroundColor Yellow

try {
    # Tenta encontrar serviço PostgreSQL (com supress de erros de permissão)
    $pgServices = @(Get-Service -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*postgresql*" -or $_.Name -like "*postgres*" })

    if ($pgServices.Count -gt 0) {
        $pgService = $pgServices[0]
        if ($pgService.Status -eq "Running") {
            Write-Host "✅ PostgreSQL já está rodando ($($pgService.Name))" -ForegroundColor Green
        } else {
            Write-Host "⏳ Iniciando PostgreSQL ($($pgService.Name))..." -ForegroundColor Yellow
            try {
                Start-Service $pgService.Name -ErrorAction Stop
                Start-Sleep -Seconds 3
                Write-Host "✅ PostgreSQL iniciado!" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Não foi possível iniciar PostgreSQL automaticamente" -ForegroundColor Yellow
                Write-Host "   Inicie manualmente: Pressione Win+R → services.msc → postgresql-x64-13 → Start" -ForegroundColor White
            }
        }
    } else {
        Write-Host "⚠️  PostgreSQL não foi detectado" -ForegroundColor Yellow
        Write-Host "   Verifique se está instalado: https://www.postgresql.org/download/windows/" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  Não foi possível verificar serviços (execute como administrador para melhor resultado)" -ForegroundColor Yellow
}

Write-Host ""

# Verificar se as pastas existem
if (-not (Test-Path "backend")) {
    Write-Host "❌ Pasta 'backend' não encontrada" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "❌ Pasta 'frontend' não encontrada" -ForegroundColor Red
    exit 1
}

# Usa npm.cmd para evitar bloqueio de ExecutionPolicy no npm.ps1
Write-Host "🔧 Iniciando Backend (porta 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; & npm.cmd run dev"

Start-Sleep -Seconds 2

Write-Host "🎨 Iniciando Frontend (porta 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Cyan; & npm.cmd run dev"

Write-Host ""
Write-Host "✅ Servidores iniciados em terminais separados" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Admin:    http://localhost:5173/login" -ForegroundColor White
Write-Host ""
Write-Host "Para parar os servidores, feche os terminais abertos ou pressione Ctrl+C em cada um." -ForegroundColor Yellow

