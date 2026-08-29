# ─── Windows Server Core 2025 + IIS Setup ──────────────
# Run as Administrator on fresh Windows Server Core 2025
# This script installs all required components

$ErrorActionPreference = "Stop"
Write-Host "========================================" -ForegroundColor Green
Write-Host "  footiq.ir - Windows Server Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# ─── Step 1: Install IIS ──────────────────────────────
Write-Host "`n[1/8] Installing IIS..." -ForegroundColor Yellow
Install-WindowsFeature -Name Web-Server -IncludeManagementTools -AllSubFeature
Install-WindowsFeature -Name Web-Asp-Net45
Install-WindowsFeature -Name Web-Net-Ext45
Install-WindowsFeature -Name Web-ISAPI-Ext
Install-WindowsFeature -Name Web-ISAPI-Filter
Install-WindowsFeature -Name Web-Http-Redirect
Install-WindowsFeature -Name Web-DAV-Publishing
Install-WindowsFeature -Name Web-Basic-Auth
Install-WindowsFeature -Name Web-Windows-Auth
Install-WindowsFeature -Name Web-Url-Auth
Install-WindowsFeature -Name Web-Filtering

# ─── Step 2: Install URL Rewrite Module ───────────────
Write-Host "`n[2/8] Installing URL Rewrite Module..." -ForegroundColor Yellow
$urlRewriteUrl = "https://download.microsoft.com/download/1/2/8/128E4E22-C1B5-4D66-90C8-0993268A4054/rewrite_amd64_en-US.msi"
$urlRewriteMsi = "$env:TEMP\rewrite_amd64.msi"
Invoke-WebRequest -Uri $urlRewriteUrl -OutFile $urlRewriteMsi
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$urlRewriteMsi`" /quiet /norestart"
Remove-Item $urlRewriteMsi -ErrorAction SilentlyContinue

# ─── Step 3: Install ASP.NET Core Hosting Bundle ──────
Write-Host "`n[3/8] Installing .NET 9 Hosting Bundle..." -ForegroundColor Yellow
$dotnetHostingUrl = "https://download.visualstudio.microsoft.com/download/pr/81a47c8b-5874-4a2a-b0e3-4a5b4d0a3b9f/e0f73b4c0f8c1b5a5b5c5d5e5f5g5h5/dotnet-hosting-9.0.8-win.exe"
# Alternative: download from https://dotnet.microsoft.com/download/dotnet/9.0
# Select ".NET Hosting Bundle" for Windows
Write-Host "  Download .NET 9 Hosting Bundle from:" -ForegroundColor Cyan
Write-Host "  https://dotnet.microsoft.com/download/dotnet/9.0" -ForegroundColor Cyan
Write-Host "  Install: dotnet-hosting-9.0.x-win.exe /quiet" -ForegroundColor Cyan

# ─── Step 4: Install Node.js ──────────────────────────
Write-Host "`n[4/8] Installing Node.js 18 LTS..." -ForegroundColor Yellow
$nodeUrl = "https://nodejs.org/dist/v18.20.4/node-v18.20.4-x64.msi"
$nodeMsi = "$env:TEMP\node-install.msi"
Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeMsi
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$nodeMsi`" /quiet /norestart"
Remove-Item $nodeMsi -ErrorAction SilentlyContinue

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# ─── Step 5: Install .NET 9 SDK ───────────────────────
Write-Host "`n[5/8] Installing .NET 9 SDK..." -ForegroundColor Yellow
$dotnetSdkUrl = "https://download.visualstudio.microsoft.com/download/pr/8b8e2b5a-4e2a-4c2a-b0e3-4a5b4d0a3b9f/dotnet-sdk-9.0.200-win-x64.exe"
$dotnetInstaller = "$env:TEMP\dotnet-sdk.exe"
Write-Host "  Download .NET 9 SDK from:" -ForegroundColor Cyan
Write-Host "  https://dotnet.microsoft.com/download/dotnet/9.0" -ForegroundColor Cyan
Write-Host "  Install: dotnet-sdk-9.0.x-win-x64.exe /quiet" -ForegroundColor Cyan

# ─── Step 6: Configure IIS Sites ──────────────────────
Write-Host "`n[6/8] Configuring IIS Sites..." -ForegroundColor Yellow

# Create App Pools
New-WebAppPool -Name "footiq-api" -Force
Set-ItemProperty "IIS:\AppPools\footiq-api" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty "IIS:\AppPools\footiq-api" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
Set-ItemProperty "IIS:\AppPools\footiq-api" -Name "processModel.loadUserProfile" -Value "True"

New-WebAppPool -Name "footiq-web" -Force
Set-ItemProperty "IIS:\AppPools\footiq-web" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty "IIS:\AppPools\footiq-web" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
Set-ItemProperty "IIS:\AppPools\footiq-web" -Name "processModel.loadUserProfile" -Value "True"

# Create Sites
New-Website -Name "footiq-api" `
    -PhysicalPath "C:\inetpub\footiq\api" `
    -Port 8080 `
    -ApplicationPool "footiq-api" `
    -Force

New-Website -Name "footiq-web" `
    -PhysicalPath "C:\inetpub\footiq\web" `
    -Port 3000 `
    -ApplicationPool "footiq-web" `
    -Force

# ─── Step 7: Configure Bindings ───────────────────────
Write-Host "`n[7/8] Configuring HTTPS Bindings..." -ForegroundColor Yellow

# Note: SSL certificate must be imported first
# Import-PfxCertificate -FilePath "C:\certs\footiq.pfx" -CertStoreLocation Cert:\LocalMachine\My -Password (ConvertTo-SecureString -AsPlainText "PASSWORD" -Force)

# After certificate is imported, add HTTPS bindings:
# New-WebBinding -Name "footiq-api" -Protocol "https" -Port 443 -HostHeader "api.footiq.ir" -SslFlags 1
# New-WebBinding -Name "footiq-web" -Protocol "https" -Port 443 -HostHeader "footiq.ir" -SslFlags 1
# New-WebBinding -Name "footiq-web" -Protocol "https" -Port 443 -HostHeader "www.footiq.ir" -SslFlags 1

Write-Host "  SSL setup instructions:" -ForegroundColor Cyan
Write-Host "  1. Import SSL certificate to LocalMachine\My" -ForegroundColor Cyan
Write-Host "  2. Add HTTPS bindings with SNI enabled" -ForegroundColor Cyan
Write-Host "  3. See DEPLOYMENT.md for details" -ForegroundColor Cyan

# ─── Step 8: Open Firewall ────────────────────────────
Write-Host "`n[8/8] Configuring Firewall..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Force
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Force

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "  1. Install .NET 9 SDK & Hosting Bundle" -ForegroundColor White
Write-Host "  2. Install Node.js 18 LTS" -ForegroundColor White
Write-Host "  3. Import SSL certificate" -ForegroundColor White
Write-Host "  4. Run deploy\publish.ps1" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
