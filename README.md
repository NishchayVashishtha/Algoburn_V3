# 🔥 AlgoBurn — Web3 Data Privacy Protocol

> **Hackathon Project** | Algorand TestNet | DPDP Act 2023 Compliant

A full-stack Web3 data privacy platform demonstrating how blockchain-based Zero-Knowledge Proofs can replace traditional plain-text PII storage in Fintech applications. Built on Algorand.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Projects in this Repo](#projects-in-this-repo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [CREDLYY$ — Phase Guide](#credlyy--phase-guide)
- [AlgoBurn Frontend](#algoburn-frontend)
- [Smart Contract](#smart-contract)
- [AI Agent](#ai-agent)
- [Enterprise API](#enterprise-api)
- [API Reference](#api-reference)
- [Demo Flow](#demo-flow)

---

## Overview

AlgoBurn solves a critical problem in modern Fintech: **sensitive user data (PAN Card, Aadhaar, income) is stored in plain text** and exposed to every administrator. This is a direct violation of the DPDP Act 2023.

**The Solution:** Replace raw PII storage with cryptographic Zero-Knowledge Proofs anchored on the Algorand blockchain. Users get a **Consent SoulBound Token (SBT)** — a non-transferable NFT that represents their data consent. When they revoke consent, the NFT is burned on-chain, triggering an AI Agent to purge their data from all enterprise systems.

### Key Innovation

```
Traditional Web2:          AlgoBurn Web3:
PAN: ABCDE1234F     →      ZKP Proof Hash + Algorand SBT
Aadhaar: 1234...    →      **** **** 5678 (masked)
Stored in plain DB  →      Consent recorded on-chain
Admin can see all   →      Admin sees only masked data
No audit trail      →      Immutable blockchain proof
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
│  CREDLYY$ Frontend (React + Vite)  │  AlgoBurn Frontend     │
│  localhost:5173                    │  localhost:5174         │
└──────────────┬──────────────────────────────────────────────┘
               │ REST API
               ▼
┌─────────────────────────────────────────────────────────────┐
│              CREDLYY$ Backend (Express)                     │
│              localhost:4000                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           @algoburn/sdk (Hybrid Mode)               │   │
│  │  mintConsent() → Real Algorand TestNet TX           │   │
│  │  burnConsent() → Simulated (demo mode)              │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌──────────────────────────────────────┐
│  Algorand   │  │  Enterprise API (Express)            │
│  TestNet    │  │  localhost:3000                      │
│             │  │                                      │
│  App ID:    │  │  Mock user database                  │
│  758657427  │  │  POST /api/v1/delete-user-data       │
└─────────────┘  └──────────────┬───────────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │  AI Agent (Python)           │
                 │  Watches Algorand Indexer    │
                 │  Triggers data purge on burn │
                 └──────────────────────────────┘
```

---

## Projects in this Repo

| Folder | Description | Port |
|--------|-------------|------|
| `credlyy/frontend` | CREDLYY$ React app (Phase 1/2/3) | 5173 |
| `credlyy/backend` | CREDLYY$ Express API + AlgoBurn SDK | 4000 |
| `frontend` | Original AlgoBurn ZKP Vault demo | 5174 |
| `enterprise-api` | Mock enterprise database server | 3000 |
| `agent-api` | Python AI Agent (blockchain watcher) | — |
| `contracts` | Algorand smart contract (AlgoPy) | — |

---

## Tech Stack

### Frontend
- **React 18** + **Vite** — fast dev server, HMR
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icon library
- **algosdk v3** — Algorand JavaScript SDK

### Backend
- **Node.js** + **Express** — REST API
- **algosdk v3** — transaction building and signing
- **dotenv** — environment configuration
- **uuid** — unique ID generation

### Blockchain
- **Algorand TestNet** — public test network
- **AlgoPy (PuyaPy)** — smart contract language
- **ARC4 ABI** — method encoding standard
- **AlgoNode** — free TestNet API endpoint

### AI Agent
- **Python 3.10+** — agent runtime
- **py-algorand-sdk** — Algorand indexer client
- **requests** — HTTP calls to enterprise API

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/NishchayVashishtha/Algoburn_V3.git
cd Algoburn_V3

# Install CREDLYY$ backend dependencies
cd credlyy/backend && npm install

# Install CREDLYY$ frontend dependencies
cd ../frontend && npm install

# Install Enterprise API dependencies
cd ../../enterprise-api && npm install

# Install AI Agent dependencies
pip install requests py-algorand-sdk
```

### Running the Full Stack

Open **3 terminals** in VS Code (`Ctrl + `` ` ```, click `+` for each):

**Terminal 1 — CREDLYY$ Backend**
```bash
cd credlyy/backend
npm start
```
Expected: `💳 CREDLYY$ Backend running on http://localhost:4000`

**Terminal 2 — CREDLYY$ Frontend**
```bash
cd credlyy/frontend
npm run dev
```
Expected: `Local: http://localhost:5173`

**Terminal 3 — Enterprise API** *(optional, for full purge demo)*
```bash
cd enterprise-api
npm start
```
Expected: `🚀 AlgoBurn Enterprise API running at http://localhost:3000`

**Terminal 4 — AI Agent** *(optional)*
```bash
cd agent-api
python agent.py
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

### `credlyy/backend/.env`

```env
# Phase Toggle — flip to switch between Phase 1 and Phase 2
IS_ALGOBURN_ENABLED=true

# Algorand TestNet Configuration
ALGORAND_APP_ID=758657427
ALGORAND_RELAYER_MNEMONIC=your 25 word mnemonic phrase here without quotes
```

### `frontend/.env` (AlgoBurn original frontend)

```env
VITE_APP_ID=758657427
VITE_RELAYER_MNEMONIC=your 25 word mnemonic phrase here
VITE_ENTERPRISE_API_URL=http://localhost:3000
VITE_ENTERPRISE_API_KEY=algoburn-dev-key
```

> ⚠️ **Security:** `.env` files are gitignored. Never commit your mnemonic.

---

## CREDLYY$ — Phase Guide

CREDLYY$ is a microlending platform built in 3 phases to demonstrate the evolution from Web2 to Web3 privacy.

### Phase 1 — Legacy Mode (`IS_ALGOBURN_ENABLED=false`)

The traditional Web2 system. Intentionally insecure to demonstrate the problem.

- PAN Card and Aadhaar stored in **plain text**
- Admin dashboard shows **raw PII** for all users
- No consent mechanism, no audit trail
- Red "UNSECURED" badge in navbar

**Demo credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@credlyy.com | admin123 |
| User | rahul@test.com | user123 |

### Phase 2 — AlgoBurn Mode (`IS_ALGOBURN_ENABLED=true`)

Privacy layer activated via the AlgoBurn SDK.

- PAN and Aadhaar **never stored in plain text**
- ZKP simulation during form submission
- **Consent SBT minted on Algorand TestNet** (real on-chain transaction)
- Admin sees only masked PII (`ABC*****F`, `**** **** 5678`)
- Green "PROTECTED" badge in navbar
- Clickable TxID links to Pera Explorer

### Phase 3 — Loan Repayment + Kill Switch

Full DPDP compliance demonstration.

- **Loan repayment panel** with EMI (₹5,000) and full payment options
- Progress bar showing repayment percentage
- **Kill Switch** (Revoke Consent button):
  - 🔒 Disabled while loan balance > 0
  - 🚨 Active (red, pulsing) when balance = ₹0
- **Certificate of Data Erasure** modal after revocation:
  - DPDP Compliance ID
  - Algorand Burn TxID
  - Exact timestamp
  - Downloadable `.txt` receipt

---

## AlgoBurn Frontend

The original AlgoBurn demo (`/frontend`) showcases the core ZKP consent flow without the lending context.

### Flow

1. **Login** — Enter email (no wallet required)
2. **ZKP Vault** — FinTech-X requests age + income verification
3. **Grant Consent** — Multi-step simulation:
   - Encrypting local data...
   - Generating Zero-Knowledge Proof...
   - Minting Consent NFT on Algorand...
4. **DPDP Dashboard** — Active consent status with kill switch
5. **Revoke** — Burns NFT, shows TxID with Pera Explorer link

### Custodial Relayer Pattern

The user **never sees a wallet popup**. All transactions are signed server-side using a pre-funded relayer account stored in `.env`. This is the "Web2.5" UX pattern — blockchain security without blockchain friction.

---

## Smart Contract

**Location:** `contracts/Algoburn/projects/Algoburn/contracts/algo_burn.py`

**App ID (TestNet):** `758657427`

**Language:** AlgoPy (PuyaPy) — compiled to AVM bytecode by the Puya compiler

### Methods

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `mint_consent()` | — | `uint64` | Creates Consent NFT, returns Asset ID |
| `claim_consent(asset_id)` | `uint64` | `void` | Transfers NFT from app to caller |
| `burn_consent(asset_id)` | `uint64` | `void` | Burns NFT, emits `ConsentRevoked` event |

### Events

```python
class ConsentRevoked(arc4.Struct):
    asset_id: arc4.UInt64
    owner: arc4.Address
```

Emitted by `burn_consent` — the AI Agent watches for this event.

### View on Explorer

[https://testnet.explorer.perawallet.app/application/758657427](https://testnet.explorer.perawallet.app/application/758657427)

---

## AI Agent

**Location:** `agent-api/agent.py`

A Python daemon that watches the Algorand TestNet for `burn_consent` transactions and triggers enterprise data purge.

### How it works

```
Every 5 seconds:
  → Query Algorand Indexer for new transactions on App 758657427
  → Check if transaction is a burn_consent ABI call (by method selector)
  → If yes: POST /api/v1/delete-user-data to Enterprise API
  → Enterprise DB marks user as [REDACTED]
```

### Running

```bash
cd agent-api
python agent.py
```

### Configuration

Edit `agent-api/agent.py` to add your relayer address mapping:

```python
RELAYER_TO_USER = {
    "YOUR_RELAYER_ADDRESS": "user_001",
}
```

---

## Enterprise API

**Location:** `enterprise-api/server.js`

A mock enterprise database demonstrating DPDP-compliant data purge.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | — | Admin dashboard UI |
| `GET` | `/api/v1/users` | — | List all users |
| `POST` | `/api/v1/delete-user-data` | `x-api-key` | Purge user PII |

### Mock Users

| User ID | Name | Email |
|---------|------|-------|
| user_001 | Amit Sharma | amit@test.com |
| user_002 | Priya Patel | priya@test.com |
| user_003 | Rahul Verma | rahul@test.com |
| user_004 | Sneha Iyer | sneha@test.com |

Admin dashboard auto-refreshes every 2 seconds at `http://localhost:3000`.

---

## API Reference

### CREDLYY$ Backend (`localhost:4000`)

#### Auth

```
POST /api/auth/login
Body: { email, password }
Response: { token, user }

POST /api/auth/signup
Body: { name, email, password }
Response: { token, user }
```

#### Loan

```
POST /api/loan/apply-traditional
Auth: Bearer token
Body: { fullName, email, phone, panCard, aadhaar, monthlyIncome, loanAmount, tenure }
Response: { applicationId, algoBurnEnabled, assetId?, consentTxId?, explorerUrl? }

GET /api/loan/my-applications
Auth: Bearer token
Response: { applications[] }

POST /api/loan/:id/repay
Auth: Bearer token
Body: { type: "emi" | "full" }
Response: { remainingBalance, fullyRepaid }

POST /api/loan/:id/revoke-consent
Auth: Bearer token
Response: { txId, explorerUrl, purgedAt, dpdpComplianceId, assetId }
```

#### Admin

```
GET /api/loan/all
Auth: Bearer token (Admin)
Response: { applications[], algoBurnEnabled }

PATCH /api/loan/:id/status
Auth: Bearer token (Admin)
Body: { status: "Pending" | "Approved" | "Rejected" }

GET /api/users
Auth: Bearer token (Admin)
Response: { users[] }
```

#### Compliance (AI Agent)

```
POST /api/compliance/purge
Header: x-api-key: algoburn-compliance-key
Body: { assetId }
Response: { status, message, timestamp }

GET /api/config
Response: { IS_ALGOBURN_ENABLED }
```

---

## Demo Flow

### Full Hackathon Demo Script

**Setup:** Start all 3 terminals. Open `http://localhost:5173`.

#### Act 1 — The Problem (Phase 1)

1. Set `IS_ALGOBURN_ENABLED=false` in `credlyy/backend/.env`, restart backend
2. Login as **User** (`rahul@test.com` / `user123`)
3. Apply for a loan — enter real-looking PAN (`ABCDE1234F`) and Aadhaar
4. Login as **Admin** (`admin@credlyy.com` / `admin123`)
5. Show the admin table — **PAN and Aadhaar visible in plain text** 😱
6. Point out the red "UNSECURED" badge

#### Act 2 — The Solution (Phase 2)

1. Set `IS_ALGOBURN_ENABLED=true`, restart backend
2. Login as User, apply for a new loan
3. Show the **ZKP loading steps** during submission
4. Show the **success screen** with real Algorand TxID — click to verify on Pera Explorer
5. Login as Admin — show **masked PAN/Aadhaar** and green "PROTECTED" badge
6. Show the **Consent SBT** asset ID linking to the blockchain

#### Act 3 — The Kill Switch (Phase 3)

1. Admin approves the loan
2. User clicks **Pay Full Now** — balance hits ₹0
3. Kill Switch turns **red and pulsing**
4. Click **Revoke Data Consent & Purge Records**
5. Show the **Certificate of Data Erasure** modal
6. Download the receipt — DPDP Compliance ID, TxID, timestamp
7. Refresh admin table — user data shows `[PURGED]`

---

## Project Structure

```
Algoburn_V3/
├── credlyy/
│   ├── backend/
│   │   ├── algoburn-sdk/
│   │   │   └── index.js          # AlgoBurn SDK (mint real, burn simulated)
│   │   ├── middleware/
│   │   │   └── auth.js           # RBAC middleware
│   │   ├── routes/
│   │   │   ├── auth.js           # Login / Signup
│   │   │   ├── loan.js           # Loan CRUD + repay + revoke
│   │   │   ├── users.js          # Admin user list
│   │   │   └── compliance.js     # AI Agent purge endpoint
│   │   ├── config.js             # IS_ALGOBURN_ENABLED flag
│   │   ├── db.js                 # In-memory mock database
│   │   ├── server.js             # Express app entry point
│   │   └── .env                  # Backend environment variables
│   └── frontend/
│       └── src/
│           ├── api.js            # All fetch calls
│           ├── App.jsx           # Auth router + config fetch
│           ├── pages/
│           │   ├── LoginPage.jsx
│           │   ├── UserDashboard.jsx
│           │   └── AdminDashboard.jsx
│           └── components/
│               ├── LoanForm.jsx          # 4-step form + ZKP simulation
│               ├── RepaymentPanel.jsx    # EMI + full payment UI
│               ├── ErasureCertificate.jsx # DPDP receipt modal
│               └── PrivacyBadge.jsx      # Navbar status badge
├── frontend/                     # Original AlgoBurn ZKP Vault
│   └── src/
│       ├── algorandService.js    # algosdk v3 transaction builder
│       ├── App.jsx
│       └── components/
│           ├── LoginCard.jsx
│           ├── ZKPVault.jsx
│           └── DPDPDashboard.jsx
├── enterprise-api/
│   ├── server.js                 # Mock enterprise DB
│   └── public/index.html         # Admin dashboard UI
├── agent-api/
│   └── agent.py                  # Blockchain watcher + purge trigger
├── contracts/
│   └── Algoburn/projects/Algoburn/contracts/
│       └── algo_burn.py          # AlgoPy smart contract
└── README.md
```

---

## Compliance

This project demonstrates compliance with:

- **DPDP Act 2023** (India) — Digital Personal Data Protection Act
- **Right to Erasure** — Users can permanently delete their data
- **Consent Management** — Explicit, revocable, blockchain-anchored consent
- **Audit Trail** — Immutable on-chain proof of consent and revocation

---

## Team

Built for the Algorand Hackathon.

- Smart Contract & AlgoBurn Protocol
- CREDLYY$ Frontend & Backend
- AI Agent & Enterprise Integration

---

## License

MIT
