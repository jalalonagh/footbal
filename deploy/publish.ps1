# ─── footiq.ir IIS Publish Script ──────────────────────
# Run this on your Windows Server Core 2025
# Requirements: .NET 9 SDK, Node.js 18+, IIS with URL Rewrite

param(
    [string]$DeployPath = "C:\inetpub\footiq",
    [string]$ApiPort = "8080",
    [string]$WebPort = "3000"
)

$ErrorActionPreference = "Stop"
Write-Host "========================================" -ForegroundColor Green
Write-Host "  footiq.ir IIS Deployment Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# ─── Step 1: Create directories ───────────────────────
Write-Host "`n[1/6] Creating directories..." -ForegroundColor Yellow
$dirs = @(
    "$DeployPath\api",
    "$DeployPath\web",
    "$DeployPath\web\public",
    "$DeployPath\web\_next",
    "$DeployPath\logs",
    "$DeployPath\uploads",
    "$DeployPath\uploads\scenario-images",
    "$DeployPath\uploads\videos"
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# ─── Step 2: Publish Backend ──────────────────────────
Write-Host "`n[2/6] Publishing Backend..." -ForegroundColor Yellow
$rootDir = Split-Path -Parent $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

Push-Location "$rootDir"
dotnet publish FootballTacticalTraining.API\FootballTacticalTraining.API.csproj `
    -c Release `
    -o "$DeployPath\api" `
    --no-restore
if ($LASTEXITCODE -ne 0) { throw "Backend publish failed" }
Pop-Location

# ─── Step 3: Build Frontend ───────────────────────────
Write-Host "`n[3/6] Building Frontend..." -ForegroundColor Yellow
Push-Location "$rootDir\football-web"

# Install dependencies
npm ci

# Set production env
$env:NEXT_PUBLIC_API_URL = "https://api.footiq.ir/api"
$env:NEXT_PUBLIC_SITE_URL = "https://footiq.ir"
$env:NODE_ENV = "production"

# Build
npm run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
Pop-Location

# ─── Step 4: Copy Frontend Files ──────────────────────
Write-Host "`n[4/6] Copying Frontend Files..." -ForegroundColor Yellow
Copy-Item -Path "$rootDir\football-web\.next\standalone\*" -Destination "$DeployPath\web" -Recurse -Force
Copy-Item -Path "$rootDir\football-web\.next\static" -Destination "$DeployPath\web\.next\static" -Recurse -Force
Copy-Item -Path "$rootDir\football-web\public\*" -Destination "$DeployPath\web\public" -Recurse -Force
Copy-Item -Path "$rootDir\football-web\messages" -Destination "$DeployPath\web\messages" -Recurse -Force

# ─── Step 5: Copy Config Files ────────────────────────
Write-Host "`n[5/6] Copying Configuration..." -ForegroundColor Yellow
Copy-Item -Path "$rootDir\deploy\iis\api-web.config" -Destination "$DeployPath\api\web.config" -Force
Copy-Item -Path "$rootDir\deploy\iis\web-web.config" -Destination "$DeployPath\web\web.config" -Force
Copy-Item -Path "$rootDir\deploy\iis\applicationHost.config" -Destination "$DeployPath\applicationHost.config" -Force

# ─── Step 6: Set Permissions ──────────────────────────
Write-Host "`n[6/6] Setting Permissions..." -ForegroundColor Yellow
icacls "$DeployPath" /grant "IIS_IUSRS:(OI)(CI)F" /T /Q
icacls "$DeployPath" /grant "IUSR:(OI)(CI)F" /T /Q
icacls "$DeployPath\uploads" /grant "IIS_IUSRS:(OI)(CI)F" /T /Q
icacls "$DeployPath\logs" /grant "IIS_IUSRS:(OI)(CI)F" /T /Q

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "  API:  http://localhost:$ApiPort" -ForegroundColor Cyan
Write-Host "  Web:  http://localhost:$WebPort" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
