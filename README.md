# Football Tactical Training Platform

A professional SaaS platform for football tactical education, positioning training, movement analysis, and decision-making development.

## Architecture

```
FootballTacticalTraining/
├── Domain/          # Entities, Enums, Domain Logic
├── Application/     # Interfaces, DTOs, Services, Contracts
├── Infrastructure/  # EF Core, Repositories, Payment, Tactical Engines
├── API/             # Controllers, Middleware, Configuration
├── Tests/           # Unit & Integration Tests
└── football-web/    # Next.js Frontend
```

**Stack:**
- Backend: .NET 9, ASP.NET Core Web API, Entity Framework Core, SQL Server
- Frontend: Next.js 16, React, TypeScript, Tailwind CSS
- Cache: Redis
- Payment: ZarinPal (abstract gateway pattern)
- Auth: JWT Bearer
- Logging: Serilog

## Quick Start

### Docker (Recommended)

```bash
docker-compose up --build
```

- API: http://localhost:5144
- Swagger: http://localhost:5144/swagger
- Frontend: http://localhost:3000
- SQL Server: localhost:1433
- Redis: localhost:6379

### Manual Setup

**Prerequisites:** .NET 9 SDK, Node.js 18+, SQL Server

```bash
# Backend
dotnet restore
cd FootballTacticalTraining.API
dotnet run

# Frontend
cd football-web
npm install
npm run dev
```

## Configuration

All secrets via environment variables or `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=FootballTacticalTraining;Trusted_Connection=True;TrustServerCertificate=True",
    "Redis": "localhost:6379"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyHereMustBe32CharactersLong!!",
    "Issuer": "FootballTacticalTraining",
    "Audience": "FootballTacticalTrainingWeb",
    "ExpiryHours": "24"
  },
  "ZarinPal": {
    "MerchantId": "",
    "IsSandbox": true
  }
}
```

## Default Credentials

- **Admin:** admin@footballtactics.com / Admin@123

## Features

### For Players
- Interactive 2D tactical simulation
- Drag-and-drop player positioning
- Real-time tactical analysis and recommendations
- Decision evaluation with scoring
- Coaching feedback and explanations
- Progress tracking and Tactical IQ
- Training plans

### For Coaches
- Team management
- Player analysis and comparison
- Scenario creation (visual editor)
- Training assignment
- Reports and analytics

### For Admins
- Subscription plan management
- Feature entitlement system
- CMS for articles and SEO
- User management
- Analytics dashboard
- Audit logging

## Subscription System

| Plan | Price (IRR) | Duration |
|------|------------|----------|
| Free | 0 | Forever |
| Player Monthly | 249,000 | 30 days |
| Player Quarterly | 649,000 | 90 days |
| Player SemiAnnual | 1,199,000 | 180 days |
| Player Annual | 1,999,000 | 365 days |
| Coach Monthly | 499,000 | 30 days |
| Coach Quarterly | 1,299,000 | 90 days |
| Coach SemiAnnual | 2,399,000 | 180 days |
| Coach Annual | 3,999,000 | 365 days |

Plans and prices are configurable via Admin Panel.

## Payment Flow (ZarinPal)

```
User selects plan → Create payment → ZarinPal redirect → User pays
→ Callback → Verify with ZarinPal → Activate subscription
```

Subscription activates ONLY after successful verification.

## 2D Football Engine

- SVG-based interactive pitch
- Normalized coordinate system (X: 0-100, Y: 0-100)
- Drag & drop player movement
- Movement path visualization
- Optimal path display
- Highlight zones for recommendations

## Tactical Engine

Separate from UI/Controllers:
- `TacticalEngine` - Situation analysis and recommendations
- `EvaluationEngine` - Decision scoring and feedback
- `RuleEngine` - Football rules from database (extensible)
- `SimulationEngine` - Real-time simulation control

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Scenarios
- `GET /api/scenarios` - List scenarios (with category/difficulty filters)
- `GET /api/scenarios/{id}` - Get scenario detail
- `POST /api/scenarios` - Create scenario (auth required)

### Tactical
- `POST /api/tactical/analyze` - Analyze game state (auth required)
- `POST /api/tactical/evaluate` - Evaluate decision (auth required)
- `POST /api/tactical/recommendations` - Get tactical recommendations (auth required)

### Subscription
- `GET /api/subscription/plans` - List available plans
- `POST /api/subscription/create-payment` - Initiate payment (auth required)
- `GET /api/subscription/callback` - ZarinPal callback
- `GET /api/subscription/active` - Get active subscription (auth required)
- `GET /api/subscription/check-feature/{key}` - Check feature access (auth required)

## Database

50 tactical scenarios seeded across 5 categories:
- Striker (10 scenarios)
- Winger (10 scenarios)
- Midfielder (10 scenarios)
- Defender (10 scenarios)
- Team (10 scenarios)

## SEO

- Dynamic sitemap generation
- Localized URLs (en/fa)
- Structured data (Article, FAQ, HowTo)
- Meta tags, Open Graph, canonical URLs
- Public training content for organic traffic

## Testing

```bash
dotnet test
```

Covers:
- Tactical Engine (position, movement, timing, scoring)
- Payment flow (create, callback, verify, duplicate, invalid)
- Authentication
- Subscription management

## License

Private - All rights reserved.
