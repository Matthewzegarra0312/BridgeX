# ReportGen - Script de Inicio Rápido
# Este script inicia automáticamente el backend y frontend

Write-Host "🚀 Iniciando ReportGen System..." -ForegroundColor Cyan
Write-Host ""

# Ruta base del proyecto
$BASE_PATH = "c:\Users\gguerrem\Downloads\BridgeX"

# Verificar que existan las carpetas
if (-not (Test-Path "$BASE_PATH\agent-reportes")) {
    Write-Host "❌ Error: No se encuentra la carpeta agent-reportes" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$BASE_PATH\reportgen-frontend")) {
    Write-Host "❌ Error: No se encuentra la carpeta reportgen-frontend" -ForegroundColor Red
    exit 1
}

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Verificar puertos
Write-Host "🔍 Verificando puertos..." -ForegroundColor Yellow

if (Test-Port 3000) {
    Write-Host "⚠️  Puerto 3000 ya está en uso (Backend)" -ForegroundColor Yellow
    Write-Host "   El backend puede estar ya ejecutándose" -ForegroundColor Gray
} else {
    Write-Host "✅ Puerto 3000 disponible (Backend)" -ForegroundColor Green
}

if (Test-Port 3001) {
    Write-Host "⚠️  Puerto 3001 ya está en uso (Frontend)" -ForegroundColor Yellow
    Write-Host "   El frontend puede estar ya ejecutándose" -ForegroundColor Gray
} else {
    Write-Host "✅ Puerto 3001 disponible (Frontend)" -ForegroundColor Green
}

Write-Host ""

# Verificar archivos .env
Write-Host "🔍 Verificando configuración..." -ForegroundColor Yellow

if (-not (Test-Path "$BASE_PATH\agent-reportes\.env")) {
    Write-Host "⚠️  Advertencia: No se encuentra archivo .env en agent-reportes" -ForegroundColor Yellow
    Write-Host "   Copia .env.example a .env y configura las credenciales" -ForegroundColor Gray
}

if (-not (Test-Path "$BASE_PATH\reportgen-frontend\.env.local")) {
    Write-Host "⚠️  Advertencia: No se encuentra archivo .env.local en reportgen-frontend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Instalando dependencias si es necesario..." -ForegroundColor Yellow
Write-Host ""

# Backend
Write-Host "Backend (agent-reportes):" -ForegroundColor Cyan
Set-Location "$BASE_PATH\agent-reportes"
if (-not (Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias..." -ForegroundColor Gray
    npm install --silent
    Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   ✅ Dependencias ya instaladas" -ForegroundColor Green
}

# Frontend
Write-Host "Frontend (reportgen-frontend):" -ForegroundColor Cyan
Set-Location "$BASE_PATH\reportgen-frontend"
if (-not (Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias..." -ForegroundColor Gray
    npm install --silent
    Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   ✅ Dependencias ya instaladas" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Cyan
Write-Host ""

# Iniciar Backend
Write-Host "📡 Iniciando Backend en puerto 3000..." -ForegroundColor Yellow
Set-Location "$BASE_PATH\agent-reportes"
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:BASE_PATH\agent-reportes
    npm run dev
}
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "🎨 Iniciando Frontend en puerto 3001..." -ForegroundColor Yellow
Set-Location "$BASE_PATH\reportgen-frontend"
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:BASE_PATH\reportgen-frontend
    npm run dev
}
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Sistema iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Información:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "   Health Check: http://localhost:3000/health" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Jobs iniciados:" -ForegroundColor Cyan
Write-Host "   Backend Job ID:  $($backendJob.Id)" -ForegroundColor White
Write-Host "   Frontend Job ID: $($frontendJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "⌨️  Comandos útiles:" -ForegroundColor Yellow
Write-Host "   Ver logs del backend:  Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor Gray
Write-Host "   Ver logs del frontend: Receive-Job -Id $($frontendJob.Id) -Keep" -ForegroundColor Gray
Write-Host "   Detener todo:          Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Abriendo navegador en 5 segundos..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Abrir navegador
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "✨ ¡Listo! El sistema está funcionando." -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para ver el menú de control..." -ForegroundColor Yellow

# Mantener el script abierto y mostrar logs
Write-Host ""
Write-Host "📊 Logs en tiempo real:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 2
        
        # Verificar estado de los jobs
        $backendState = (Get-Job -Id $backendJob.Id).State
        $frontendState = (Get-Job -Id $frontendJob.Id).State
        
        if ($backendState -eq "Failed") {
            Write-Host "❌ Backend falló. Ver errores con: Receive-Job -Id $($backendJob.Id)" -ForegroundColor Red
            break
        }
        
        if ($frontendState -eq "Failed") {
            Write-Host "❌ Frontend falló. Ver errores con: Receive-Job -Id $($frontendJob.Id)" -ForegroundColor Red
            break
        }
    }
}
finally {
    Write-Host ""
    Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow
    Stop-Job -Id $backendJob.Id
    Stop-Job -Id $frontendJob.Id
    Remove-Job -Id $backendJob.Id
    Remove-Job -Id $frontendJob.Id
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
}
