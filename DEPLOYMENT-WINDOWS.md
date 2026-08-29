# footiq.ir — Windows Server Core 2025 + IIS Deployment

## Architecture
```
footiq.ir:443 ──→ IIS (port 80/443) ──→ Next.js (port 3000)  [Frontend]
api.footiq.ir:443 ──→ IIS (port 80/443) ──→ .NET API (port 8080)  [Backend]
                 ──→ SQL Server (93.118.113.229)  [Database]
                 ──→ Redis (127.0.0.1:6379)  [Cache]
```

---

## Prerequisites

| Component | Version | Download |
|-----------|---------|----------|
| Windows Server Core 2025 | Latest | Microsoft |
| .NET 9 SDK | 9.0+ | https://dotnet.microsoft.com/download/dotnet/9.0 |
| .NET 9 Hosting Bundle | 9.0+ | https://dotnet.microsoft.com/download/dotnet/9.0 |
| Node.js | 18 LTS | https://nodejs.org |
| IIS | 10 | Windows Feature |
| URL Rewrite | 2.1 | NuGet / IIS.net |
| SQL Server | 2022+ | Existing (93.118.113.229) |
| Redis | 7+ | Existing (127.0.0.1:6379) |

---

## Step 1: Server Setup (One-time)

### Option A: Run the setup script (recommended)
```powershell
# Run as Administrator
Set-ExecutionPolicy RemoteSigned -Force
.\deploy\setup-iis.ps1
```

### Option B: Manual setup
```powershell
# Install IIS
Install-WindowsFeature -Name Web-Server -IncludeManagementTools

# Install URL Rewrite
# Download from: https://www.iis.net/downloads/microsoft/url-rewrite

# Install .NET 9 Hosting Bundle
# Download from: https://dotnet.microsoft.com/download/dotnet/9.0
# Select: ASP.NET Core Runtime Hosting Bundle

# Install .NET 9 SDK
# Download from: https://dotnet.microsoft.com/download/dotnet/9.0
# Select: .NET SDK

# Install Node.js 18 LTS
# Download from: https://nodejs.org
```

---

## Step 2: DNS Configuration

In your domain registrar, add:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| A | api | YOUR_SERVER_IP | 3600 |
| A | www | YOUR_SERVER_IP | 3600 |

---

## Step 3: SSL Certificate

### Option A: Let's Encrypt (free, recommended)
```powershell
# Install win-acme
choco install win-acme

# Get certificate
wacs.exe --target iis --host footiq.ir --host api.footiq.ir --host www.footiq.ir
```

### Option B: Commercial certificate
1. Generate CSR on server
2. Submit to certificate authority
3. Import PFX:
```powershell
Import-PfxCertificate -FilePath "C:\certs\footiq.pfx" `
    -CertStoreLocation Cert:\LocalMachine\My `
    -Password (ConvertTo-SecureString -AsPlainText "YOUR_PASSWORD" -Force)
```

### Add HTTPS Bindings in IIS
```powershell
# Get the certificate thumbprint
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Subject -like "*footiq*"}

# Add HTTPS bindings
New-WebBinding -Name "footiq-api" -Protocol "https" -Port 443 -HostHeader "api.footiq.ir" -SslFlags 1
New-WebBinding -Name "footiq-web" -Protocol "https" -Port 443 -HostHeader "footiq.ir" -SslFlags 1
New-WebBinding -Name "footiq-web" -Protocol "https" -Port 443 -HostHeader "www.footiq.ir" -SslFlags 1

# Bind certificate
$binding = Get-WebBinding -Name "footiq-api" -Protocol "https"
$binding.AddSslCertificate($cert.Thumbprint, "My")
$binding = Get-WebBinding -Name "footiq-web" -Protocol "https"
$binding.AddSslCertificate($cert.Thumbprint, "My")
```

---

## Step 4: Configure Environment

### On the server, create C:\inetpub\footiq\config\appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_CONNECTION_STRING",
    "Redis": "YOUR_REDIS_STRING"
  },
  "Jwt": {
    "Key": "YOUR_32_CHAR_SECRET_KEY",
    "Issuer": "footiq",
    "Audience": "footiq-web",
    "ExpiryHours": "168"
  },
  "Cors": {
    "Origins": "https://footiq.ir,https://www.footiq.ir,http://localhost:3000"
  },
  "AI": {
    "BaseUrl": "YOUR_AI_BASE_URL",
    "ApiKey": "YOUR_AI_API_KEY",
    "Model": "DeepSeek-V4-Flash"
  },
  "ZarinPal": {
    "MerchantId": "YOUR_MERCHANT_ID",
    "IsSandbox": false
  }
}
```

### Create C:\inetpub\footiq\web\.env
```
NEXT_PUBLIC_API_URL=https://api.footiq.ir/api
NEXT_PUBLIC_SITE_URL=https://footiq.ir
```

---

## Step 5: Publish & Deploy

### On your development machine:
```powershell
# Run the publish script
.\deploy\publish.ps1 -DeployPath "C:\inetpub\footiq"

# Copy to server (if building locally)
# Use robocopy, scp, or file share
robocopy "C:\inetpub\footiq" "\\SERVER\C$\inetpub\footiq" /MIR
```

### On the server:
```powershell
# If you copied files, skip to this step
# Create appsettings.json with your secrets (see Step 4)

# Restart IIS
iisreset

# Test
curl http://localhost:8080/api/academy
curl http://localhost:3000
```

---

## Step 6: Verify

```powershell
# Test API
Invoke-WebRequest -Uri "https://api.footiq.ir/api/academy" -UseBasicParsing

# Test Frontend
Invoke-WebRequest -Uri "https://footiq.ir" -UseBasicParsing

# Check IIS sites
Get-Website

# Check app pools
Get-WebAppPoolState
```

---

## Quick Commands

```powershell
# Restart IIS
iisreset

# Restart specific app pool
Restart-WebAppPool -Name "footiq-api"
Restart-WebAppPool -Name "footiq-web"

# View IIS logs
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\*.log" -Tail 50

# View API stdout logs
Get-Content "C:\inetpub\footiq\api\logs\stdout*.log" -Tail 50

# Check .NET version
dotnet --info

# Check Node.js version
node --version
```

---

## Troubleshooting

### 503 Service Unavailable
- Check app pool is started: `Get-WebAppPoolState -Name "footiq-api"`
- Check app pool identity has permissions to the folder
- Check .NET Hosting Bundle is installed: `dotnet --info`

### 502 Bad Gateway
- Check the backend process is running: `Get-Process -Name dotnet`
- Check port binding: `netstat -ano | findstr 8080`
- Check stdout logs: `C:\inetpub\footiq\api\logs\stdout*.log`

### CORS Error
- Check `Cors:Origins` in appsettings.json includes `https://footiq.ir`
- Check URL Rewrite is installed and configured

### Frontend can't reach API
- Check `NEXT_PUBLIC_API_URL=https://api.footiq.ir/api`
- Verify DNS: `nslookup api.footiq.ir`
- Check URL Rewrite rules in IIS

### SSL Certificate Error
- Check certificate is imported to LocalMachine\My
- Check HTTPS binding has certificate assigned
- Check certificate is not expired

### Node.js not found
- Add Node.js to PATH: `$env:Path += ";C:\Program Files\nodejs\"`
- Or set in IIS app pool environment variables
