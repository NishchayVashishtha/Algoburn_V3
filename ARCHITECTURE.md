# 🏗️ AlgoBurn Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Netlify/Vercel)                           │ │
│  │  - Login UI                                                │ │
│  │  - Consent Management Dashboard                            │ │
│  │  - No private keys!                                        │ │
│  └────────────────┬───────────────────────────────────────────┘ │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    │ HTTPS + API Key
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend Relayer (Railway/Render)                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Node.js + Express                                         │ │
│  │  - Holds relayer mnemonic (secure!)                        │ │
│  │  - Signs transactions                                      │ │
│  │  - API: /api/mint-consent                                  │ │
│  │  - API: /api/burn-consent                                  │ │
│  │  - API: /api/claim-consent                                 │ │
│  └────────────────┬───────────────────────────────────────────┘ │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    │ Signed Transactions
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Algorand Blockchain (Testnet)                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Smart Contract (App ID: 758657427)                        │ │
│  │  - mint_consent() → Creates SBT                            │ │
│  │  - claim_consent() → Transfers SBT                         │ │
│  │  - burn_consent() → Destroys SBT                           │ │
│  │  - Emits: ConsentRevoked event                             │ │
│  └────────────────┬───────────────────────────────────────────┘ │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    │ Blockchain Events
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI Agent (Railway/Render Worker)                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Python + Algorand Indexer                                 │ │
│  │  - Polls blockchain every 5 seconds                        │ │
│  │  - Detects burn_consent transactions                       │ │
│  │  - Extracts Asset ID from foreign-assets                   │ │
│  │  - Triggers enterprise API                                 │ │
│  └────────────────┬───────────────────────────────────────────┘ │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    │ HTTP POST + API Key
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Enterprise API (Railway)                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Node.js + Express                                         │ │
│  │  - Mock enterprise database                                │ │
│  │  - API: POST /api/v1/delete-user-data                      │ │
│  │  - Marks user as "Purged"                                  │ │
│  │  - Redacts PII: [REDACTED]                                 │ │
│  │  - Admin dashboard UI                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Grant Consent (Mint NFT)

```
User clicks "Grant Consent"
    │
    ├─► Frontend sends POST to Backend Relayer
    │   Body: {}
    │   Headers: { x-api-key: "..." }
    │
    ├─► Backend Relayer validates API key
    │
    ├─► Backend creates transaction:
    │   - Method: mint_consent()
    │   - Sender: Relayer address
    │   - Fee: 3000 microALGO
    │
    ├─► Backend signs with private key
    │
    ├─► Backend submits to Algorand
    │
    ├─► Smart Contract executes:
    │   1. Creates ASA (Algorand Standard Asset)
    │   2. Sets contract as manager/freeze/clawback
    │   3. Opts contract into asset
    │   4. Returns Asset ID
    │
    ├─► Transaction confirmed (~4 seconds)
    │
    ├─► Backend returns to Frontend:
    │   {
    │     success: true,
    │     txId: "ABC123...",
    │     assetId: 123456,
    │     confirmedRound: 12345,
    │     explorerUrl: "https://..."
    │   }
    │
    └─► Frontend displays success + Asset ID
```

### 2. Revoke Consent (Burn NFT)

```
User clicks "Revoke Consent"
    │
    ├─► Frontend sends POST to Backend Relayer
    │   Body: { assetId: 123456 }
    │   Headers: { x-api-key: "..." }
    │
    ├─► Backend Relayer validates API key
    │
    ├─► Backend creates transaction:
    │   - Method: burn_consent(assetId)
    │   - Sender: Relayer address
    │   - Foreign Assets: [assetId]
    │   - Fee: 3000 microALGO
    │
    ├─► Backend signs with private key
    │
    ├─► Backend submits to Algorand
    │
    ├─► Smart Contract executes:
    │   1. Claws back asset from user
    │   2. Destroys asset (sets total=0)
    │   3. Emits ConsentRevoked event
    │
    ├─► Transaction confirmed (~4 seconds)
    │
    ├─► AI Agent detects transaction (~5 seconds)
    │   - Polls Indexer: search_transactions(app_id=758657427)
    │   - Finds burn transaction
    │   - Extracts Asset ID from foreign-assets
    │
    ├─► AI Agent calls Enterprise API:
    │   POST /api/v1/delete-user-data
    │   Body: {
    │     userId: "user_001",
    │     assetId: 123456,
    │     proof: "ABC123...",
    │     timestamp: 1234567890
    │   }
    │   Headers: { x-api-key: "algoburn-dev-key" }
    │
    ├─► Enterprise API purges data:
    │   - Sets status: "Purged"
    │   - Sets email: "[REDACTED]"
    │   - Sets name: "[REDACTED]"
    │   - Logs compliance action
    │
    └─► User data successfully purged!
```

---

## Security Architecture

### Authentication Flow

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
       │ 1. User action (mint/burn)
       │
       ▼
┌──────────────────────────────────────┐
│  Backend Relayer                     │
│  ┌────────────────────────────────┐ │
│  │  API Key Middleware            │ │
│  │  - Checks x-api-key header     │ │
│  │  - Validates against API_KEY   │ │
│  │  - Returns 401 if invalid      │ │
│  └────────────┬───────────────────┘ │
│               │                      │
│               ▼                      │
│  ┌────────────────────────────────┐ │
│  │  Transaction Signing           │ │
│  │  - Uses RELAYER_MNEMONIC       │ │
│  │  - Never exposed to frontend   │ │
│  │  - Signs with algosdk          │ │
│  └────────────┬───────────────────┘ │
└───────────────┼─────────────────────┘
                │
                ▼
        Algorand Blockchain
```

### CORS Protection

```
Browser Request
    │
    ├─► Origin: https://algoburn.netlify.app
    │
    ▼
Backend Relayer
    │
    ├─► Check ALLOWED_ORIGINS
    │   - http://localhost:5173 ✅
    │   - https://algoburn.netlify.app ✅
    │   - https://evil-site.com ❌
    │
    ├─► If allowed:
    │   - Set CORS headers
    │   - Process request
    │
    └─► If not allowed:
        - Return CORS error
        - Block request
```

---

## Component Responsibilities

### Frontend (React)
**Responsibilities:**
- User interface
- Form validation
- API calls to backend
- Display transaction results

**Does NOT:**
- Sign transactions
- Hold private keys
- Interact with blockchain directly

### Backend Relayer (Node.js)
**Responsibilities:**
- Transaction signing
- Private key management
- API authentication
- CORS enforcement

**Does NOT:**
- Store user data
- Monitor blockchain
- Trigger data deletion

### Smart Contract (PuyaPy)
**Responsibilities:**
- Create SoulBound Tokens
- Transfer tokens
- Destroy tokens
- Emit events

**Does NOT:**
- Store user data
- Validate business logic
- Communicate with external APIs

### AI Agent (Python)
**Responsibilities:**
- Monitor blockchain 24/7
- Detect burn events
- Trigger enterprise API
- Log actions

**Does NOT:**
- Sign transactions
- Store data
- Interact with users

### Enterprise API (Node.js)
**Responsibilities:**
- Store user data
- Purge data on request
- Provide admin dashboard
- Log compliance actions

**Does NOT:**
- Interact with blockchain
- Sign transactions
- Monitor events

---

## Technology Stack

### Frontend
```
React 18.3.1
├── Vite 6.0.5 (build tool)
├── Tailwind CSS 3.4.17 (styling)
└── No algosdk (security!)
```

### Backend Relayer
```
Node.js 18+
├── Express 4.18.2 (web framework)
├── algosdk 2.11.0 (Algorand SDK)
├── cors 2.8.5 (CORS middleware)
└── dotenv 16.4.5 (environment variables)
```

### Smart Contract
```
Algorand Python (PuyaPy)
├── algopy (framework)
├── Compiled to TEAL
└── Deployed to Testnet
```

### AI Agent
```
Python 3.9+
├── py-algorand-sdk 2.6.1 (Algorand SDK)
├── requests 2.32.5 (HTTP client)
└── Runs as background worker
```

### Enterprise API
```
Node.js 18+
├── Express 4.18.2 (web framework)
├── cors 2.8.5 (CORS middleware)
└── In-memory database (demo)
```

---

## Deployment Architecture

### Development (Local)
```
localhost:5173  → Frontend
localhost:3001  → Backend Relayer
localhost:3000  → Enterprise API
Background      → AI Agent
Testnet         → Smart Contract
```

### Production (Cloud)
```
algoburn.netlify.app           → Frontend (Netlify)
algoburn-relayer.railway.app   → Backend Relayer (Railway)
algoburn-enterprise.railway.app → Enterprise API (Railway)
Railway Worker                  → AI Agent (Railway)
Algorand Testnet               → Smart Contract
```

---

## Scalability Considerations

### Current Limits
- **Frontend**: Unlimited (static hosting)
- **Backend Relayer**: ~100 req/sec (single instance)
- **AI Agent**: Polls every 5 seconds (can miss rapid burns)
- **Enterprise API**: ~100 req/sec (single instance)

### Scaling Options

#### Horizontal Scaling
```
Load Balancer
    ├─► Backend Relayer Instance 1
    ├─► Backend Relayer Instance 2
    └─► Backend Relayer Instance 3
```

#### AI Agent Improvements
```
Current: Poll every 5 seconds
Better:  WebSocket subscription to Indexer
Best:    Algorand Node with event streaming
```

#### Database
```
Current: In-memory (demo)
Better:  PostgreSQL (single instance)
Best:    PostgreSQL with read replicas
```

---

## Security Layers

### Layer 1: Network
- ✅ HTTPS everywhere
- ✅ CORS restrictions
- ✅ No public IPs for databases

### Layer 2: Authentication
- ✅ API key for backend relayer
- ✅ API key for enterprise API
- ✅ No authentication bypass

### Layer 3: Authorization
- ✅ Backend validates all requests
- ✅ Smart contract enforces rules
- ✅ AI agent validates events

### Layer 4: Data
- ✅ Private keys in backend only
- ✅ Environment variables for secrets
- ✅ No secrets in code or logs

### Layer 5: Blockchain
- ✅ Immutable transaction history
- ✅ Cryptographic proof
- ✅ No single point of failure

---

## Monitoring & Observability

### What to Monitor

#### Backend Relayer
- Request rate
- Error rate
- Response time
- Relayer balance

#### AI Agent
- Polling frequency
- Events detected
- API call success rate
- Lag time (detection to purge)

#### Enterprise API
- Request rate
- Purge success rate
- Database size
- Response time

### Recommended Tools
- **Logs**: Railway/Render built-in logs
- **Errors**: Sentry
- **Uptime**: UptimeRobot
- **Analytics**: Google Analytics (frontend)

---

## Disaster Recovery

### Backup Strategy
- **Smart Contract**: Immutable on blockchain
- **Backend Code**: Git repository
- **Environment Variables**: Password manager
- **User Data**: Database backups (if using real DB)

### Recovery Procedures
1. **Backend Relayer Down**: Deploy new instance with same mnemonic
2. **AI Agent Down**: Restart worker, will catch up from last round
3. **Enterprise API Down**: Deploy new instance, restore database
4. **Frontend Down**: Redeploy from Git

---

This architecture is designed for:
- ✅ Security (no exposed keys)
- ✅ Scalability (can handle growth)
- ✅ Reliability (multiple layers)
- ✅ Maintainability (clear separation)
- ✅ Compliance (audit trail)
