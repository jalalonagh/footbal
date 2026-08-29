# ─── Server Environment Setup ──────────────────────────
# Run this on the server after first deploy to set up secrets

param(
    [Parameter(Mandatory=$true)]
    [string]$DbConnectionString,
    
    [Parameter(Mandatory=$true)]
    [string]$JwtKey,
    
    [string]$RedisConnection = "127.0.0.1:6379",
    [string]$AiBaseUrl = "",
    [string]$AiApiKey = "",
    [string]$ZarinPalMerchantId = "",
    [string]$DeployPath = "C:\inetpub\footiq"
)

$ErrorActionPreference = "Stop"

# ─── Create appsettings.json ──────────────────────────
Write-Host "Creating appsettings.json..." -ForegroundColor Yellow

$appSettings = @"
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "$DbConnectionString",
    "Redis": "$RedisConnection"
  },
  "Jwt": {
    "Key": "$JwtKey",
    "Issuer": "footiq",
    "Audience": "footiq-web",
    "ExpiryHours": "168"
  },
  "ZarinPal": {
    "MerchantId": "$ZarinPalMerchantId",
    "IsSandbox": false,
    "ApiUrl": "https://api.zarinpal.com/pg/v4/payment/request.json",
    "VerifyUrl": "https://api.zarinpal.com/pg/v4/payment/verify.json",
    "GatewayUrl": "https://www.zarinpal.com/pg/StartPay/",
    "SandboxApiUrl": "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
    "SandboxVerifyUrl": "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
    "SandboxGatewayUrl": "https://sandbox.zarinpal.com/pg/StartPay/"
  },
  "Cors": {
    "Origins": "https://footiq.ir,https://www.footiq.ir,http://localhost:3000"
  },
  "AI": {
    "BaseUrl": "$AiBaseUrl",
    "ApiKey": "$AiApiKey",
    "Model": "DeepSeek-V4-Flash"
  }
}
"@

$appSettings | Out-File -FilePath "$DeployPath\api\appsettings.Production.json" -Encoding utf8 -Force

# ─── Create web .env ──────────────────────────────────
Write-Host "Creating web .env..." -ForegroundColor Yellow

@"
NEXT_PUBLIC_API_URL=https://api.footiq.ir/api
NEXT_PUBLIC_SITE_URL=https://footiq.ir
NODE_ENV=production
"@ | Out-File -FilePath "$DeployPath\web\.env" -Encoding utf8 -Force

# ─── Create directories ───────────────────────────────
Write-Host "Creating directories..." -ForegroundColor Yellow

$dirs = @(
    "$DeployPath\uploads",
    "$DeployPath\uploads\scenario-images",
    "$DeployPath\uploads\videos",
    "$DeployPath\logs"
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# ─── Set permissions ──────────────────────────────────
Write-Host "Setting permissions..." -ForegroundColor Yellow

icacls "$DeployPath" /grant "IIS_IUSRS:(OI)(CI)F" /T /Q
icacls "$DeployPath" /grant "IUSR:(OI)(CI)F" /T /Q
icacls "$DeployPath\uploads" /grant "IIS_IUSRS:(OI)(CI)F" /T /Q
icacls "$DeployPath\logs" /grant "IIS_IUSRS:(OI)(CI)F" /T /Q

# ─── Restart IIS ──────────────────────────────────────
Write-Host "Restarting IIS..." -ForegroundColor Yellow
iisreset

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "API: https://api.footiq.ir" -ForegroundColor Cyan
Write-Host "Web: https://footiq.ir" -ForegroundColor Cyan
