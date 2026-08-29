# footiq.ir Deployment Checklist

## Pre-Deployment

- [ ] Windows Server Core 2025 is installed and accessible via RDP/SSH
- [ ] IIS is installed with Management Tools
- [ ] URL Rewrite Module is installed
- [ ] .NET 9 SDK is installed
- [ ] .NET 9 ASP.NET Core Hosting Bundle is installed
- [ ] Node.js 18 LTS is installed
- [ ] SSL certificate is obtained and imported
- [ ] DNS records are configured (A records for @, api, www)

## Server Setup

- [ ] Run `deploy\setup-iis.ps1` as Administrator
- [ ] IIS App Pools created (footiq-api, footiq-web)
- [ ] IIS Sites created (footiq-api on 8080, footiq-web on 3000)
- [ ] HTTPS bindings configured with SSL certificate
- [ ] Firewall ports 80, 443 are open

## Application Deployment

- [ ] Run `deploy\publish.ps1` on development machine
- [ ] Copy published files to server
- [ ] Create `C:\inetpub\footiq\api\appsettings.Production.json` with secrets
- [ ] Create `C:\inetpub\footiq\web\.env` with production URLs
- [ ] Set folder permissions for IIS_IUSRS and IUSR
- [ ] Run `deploy\setup-server-env.ps1` or manually configure

## Verification

- [ ] `curl http://localhost:8080/api/academy` returns data
- [ ] `curl http://localhost:3000` returns HTML
- [ ] `https://api.footiq.ir/api/academy` works from external
- [ ] `https://footiq.ir` loads the frontend
- [ ] Login/Register works
- [ ] AI features work
- [ ] File uploads work (scenario images, videos)
- [ ] Payment integration works (ZarinPal)

## Security

- [ ] appsettings.Production.json contains real secrets (not in git)
- [ ] SSL certificate is valid and not expired
- [ ] CORS is configured for footiq.ir only
- [ ] Swagger is disabled in production
- [ ] SQL Server has strong password
- [ ] Redis has password configured
- [ ] Firewall only allows ports 80, 443, 3389 (RDP)
