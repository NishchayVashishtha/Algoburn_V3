# 🔐 Environment Variables Guide

Complete reference for all environment variables needed across AlgoBurn services.

---

## 📋 Quick Reference Table

| Variable | Service | Required | Example | Description |
|----------|---------|----------|---------|-------------|
| `APP_ID` | Backend Relayer, AI Agent | ✅ Yes | `758657427` | Algorand smart contract app ID |
| `RELAYER_MNEMONIC` | Backend Relayer | ✅ Yes | `"word1 word2 ... word25"` | 25-word Algorand mnemonic |
| `API_KEY` | Backend Relayer, Enterprise API | ✅ Yes | `"secure-random-key-123"` | API authentication key |
| `ALLOWED_ORIGINS` | Backend Relayer | ✅ Yes | `"http://localhost:5173,https://app.com"` | CORS allowed origins |
| `PORT` | Backend Relayer, Enterprise API | ⚠️ Optional | `3001` | Server port |
| `VITE_BACKEND_URL` | Frontend | ✅ Yes | `"https://relayer.railway.app"` | Backend relayer URL |
| `VITE_API_KEY` | Frontend | ✅ Yes | `"secure-random-key-123"` | API key (matches backend) |
| `INDEXER_URL` | AI Agent | ✅ Yes | `"https://testnet-idx.algonode.cloud"` | Algorand indexer URL |
| `ENTERPRISE_API_URL` | AI Agent | ✅ Yes | `"https://enterprise.railway.app/api/v1/delete-user-data"` | Enterprise API endpoint |
| `ENTERPRISE_API_KEY` | AI Agent | ✅ Yes | `"algoburn-dev-key"` | Enterprise API key |

---

## 🎯 By Service

### 1. Backend Relayer

**File**: `frontend/backend-relayer/.env`

```bash
# Algorand Configuration
APP_ID=758657427

# Security - CRITICAL: Keep this secret!
RELAYER_MNEMONIC="your 25 word mnemonic phrase from pera wallet or algokit"

# API Security
API_KEY="generate-a-secure-random-key-here"

# CORS Configuration
# Add all your frontend URLs (comma-separated, no spaces)
ALLOWED_ORIGINS="http://localhost:5173,https://your-app.netlify.app"

# Server Configuration
PORT=3001
```

#### How to Get Values

**APP_ID:**
- Use the deployed smart contract ID
- Current testnet: `758657427`
- For mainnet: Deploy contract and use that ID

**RELAYER_MNEMONIC:**
```bash
# Option 1: From Pera Wallet
# Settings → Account → Show Passphrase → Copy all 25 words

# Option 2: Generate new account with AlgoKit
algokit goal account new
# Copy the mnemonic shown

# Option 3: Use existing AlgoKit account
algokit goal account export -a YOUR_ADDRESS
```

**API_KEY:**
```bash
# Generate a secure random key:

# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 32

# Option 3: Python
python -c "import secrets; print(secrets.token_hex(32))"

# Option 4: Online (use with caution)
# https://www.random.org/strings/
```

**ALLOWED_ORIGINS:**
```bash
# Development only:
ALLOWED_ORIGINS="http://localhost:5173"

# Development + Production:
ALLOWED_ORIGINS="http://localhost:5173,https://algoburn.netlify.app"

# Multiple production domains:
ALLOWED_ORIGINS="https://algoburn.netlify.app,https://algoburn.vercel.app"

# ⚠️ NEVER use "*" in production!
```

---

### 2. Frontend

**File**: `frontend/.env.local`

```bash
# Backend Relayer URL
# Local development:
VITE_BACKEND_URL=http://localhost:3001

# Production (update after deploying backend):
# VITE_BACKEND_URL=https://algoburn-relayer.railway.app

# API Key (must match backend API_KEY)
VITE_API_KEY="same-key-as-backend-relayer"
```

#### Important Notes

- ⚠️ **Use `.env.local` not `.env`** - `.env.local` is gitignored
- ⚠️ **VITE_ prefix is required** - Vite only exposes vars with this prefix
- ⚠️ **No quotes in Netlify/Vercel** - When setting in dashboard, don't use quotes

#### Platform-Specific Setup

**Netlify:**
1. Site Settings → Environment Variables
2. Add `VITE_BACKEND_URL` = `https://your-relayer.railway.app`
3. Add `VITE_API_KEY` = `your-api-key`
4. Redeploy site

**Vercel:**
1. Project Settings → Environment Variables
2. Add `VITE_BACKEND_URL` = `https://your-relayer.railway.app`
3. Add `VITE_API_KEY` = `your-api-key`
4. Redeploy

---

### 3. AI Agent

**File**: `agent-api/.env`

```bash
# Algorand Configuration
APP_ID=758657427
INDEXER_URL=https://testnet-idx.algonode.cloud

# Enterprise API Configuration
# Update this after deploying enterprise API
ENTERPRISE_API_URL=https://algoburn-enterprise.railway.app/api/v1/delete-user-data
ENTERPRISE_API_KEY=algoburn-dev-key
```

#### How to Get Values

**APP_ID:**
- Same as backend relayer
- `758657427` for testnet

**INDEXER_URL:**
```bash
# Testnet (free):
https://testnet-idx.algonode.cloud

# Mainnet (free):
https://mainnet-idx.algonode.cloud

# Custom node (if you run your own):
http://your-node-ip:8980
```

**ENTERPRISE_API_URL:**
- Deploy enterprise API first
- Copy the public URL
- Add `/api/v1/delete-user-data` to the end
- Example: `https://algoburn-enterprise.railway.app/api/v1/delete-user-data`

**ENTERPRISE_API_KEY:**
- Must match the `API_KEY` in enterprise API
- Default: `algoburn-dev-key`
- Change in production!

---

### 4. Enterprise API

**File**: `enterprise-api/.env` (optional, has defaults)

```bash
# API Security
API_KEY=algoburn-dev-key

# Server Configuration
PORT=3000
```

#### How to Get Values

**API_KEY:**
- Use the same key as `ENTERPRISE_API_KEY` in AI agent
- Generate a secure random key (see Backend Relayer section)
- Default: `algoburn-dev-key` (change in production!)

**PORT:**
- Default: `3000`
- Railway/Render will override this automatically
- Only needed for local development

---

## 🔄 Variable Dependencies

Some variables must match across services:

### API Keys Must Match

```
Backend Relayer:
  API_KEY="my-secret-key-123"
      ↓
Frontend:
  VITE_API_KEY="my-secret-key-123"  ← Must be the same!
```

```
Enterprise API:
  API_KEY="algoburn-dev-key"
      ↓
AI Agent:
  ENTERPRISE_API_KEY="algoburn-dev-key"  ← Must be the same!
```

### URLs Must Match

```
Backend Relayer deployed to:
  https://algoburn-relayer.railway.app
      ↓
Frontend:
  VITE_BACKEND_URL="https://algoburn-relayer.railway.app"  ← Must match!
      ↓
Backend Relayer:
  ALLOWED_ORIGINS="...,https://algoburn.netlify.app"  ← Add frontend URL!
```

```
Enterprise API deployed to:
  https://algoburn-enterprise.railway.app
      ↓
AI Agent:
  ENTERPRISE_API_URL="https://algoburn-enterprise.railway.app/api/v1/delete-user-data"
```

---

## 🚀 Deployment Platforms

### Railway

**Setting Environment Variables:**
1. Go to your project
2. Click on the service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add key and value
6. Click "Deploy" to apply

**Example:**
```
APP_ID = 758657427
RELAYER_MNEMONIC = word1 word2 ... word25
API_KEY = abc123...
```

### Render

**Setting Environment Variables:**
1. Go to your service
2. Click "Environment"
3. Click "Add Environment Variable"
4. Add key and value
5. Click "Save Changes"

**Example:**
```
APP_ID = 758657427
RELAYER_MNEMONIC = word1 word2 ... word25
API_KEY = abc123...
```

### Netlify

**Setting Environment Variables:**
1. Site Settings → Environment Variables
2. Click "Add a variable"
3. Add key and value
4. Click "Create variable"
5. Redeploy site

**Example:**
```
VITE_BACKEND_URL = https://algoburn-relayer.railway.app
VITE_API_KEY = abc123...
```

### Vercel

**Setting Environment Variables:**
1. Project Settings → Environment Variables
2. Add key, value, and environment (Production/Preview/Development)
3. Click "Save"
4. Redeploy

**Example:**
```
VITE_BACKEND_URL = https://algoburn-relayer.railway.app
VITE_API_KEY = abc123...
```

---

## ✅ Validation Checklist

Before deploying, verify:

### Backend Relayer
- [ ] `APP_ID` is a valid number
- [ ] `RELAYER_MNEMONIC` is 25 words
- [ ] `API_KEY` is strong (32+ characters)
- [ ] `ALLOWED_ORIGINS` includes your frontend URL
- [ ] No quotes around mnemonic in Railway/Render

### Frontend
- [ ] `VITE_BACKEND_URL` matches deployed backend URL
- [ ] `VITE_API_KEY` matches backend `API_KEY`
- [ ] Variables start with `VITE_` prefix
- [ ] No trailing slashes in URLs

### AI Agent
- [ ] `APP_ID` matches backend relayer
- [ ] `INDEXER_URL` is correct for testnet/mainnet
- [ ] `ENTERPRISE_API_URL` includes full path with `/api/v1/delete-user-data`
- [ ] `ENTERPRISE_API_KEY` matches enterprise API

### Enterprise API
- [ ] `API_KEY` matches AI agent `ENTERPRISE_API_KEY`
- [ ] `PORT` is set (or using default)

---

## 🔐 Security Best Practices

### DO ✅
- Use strong random API keys (32+ characters)
- Store mnemonics in password manager
- Use different API keys for different services
- Restrict CORS to specific domains
- Use `.env.local` for local development
- Set variables in platform dashboards, not in code

### DON'T ❌
- Commit `.env` files to Git
- Use simple API keys like "password123"
- Use `*` for ALLOWED_ORIGINS in production
- Share mnemonics in chat/email
- Hardcode secrets in code
- Reuse the same API key everywhere

---

## 🐛 Troubleshooting

### "Invalid RELAYER_MNEMONIC"
```bash
# Check:
1. Is it exactly 25 words?
2. Are there extra spaces?
3. Are there quotes in Railway/Render? (remove them)
4. Is it a valid Algorand mnemonic?

# Test locally:
node -e "const algosdk = require('algosdk'); console.log(algosdk.mnemonicToSecretKey('your mnemonic here').addr)"
```

### "CORS Error"
```bash
# Check:
1. Is frontend URL in ALLOWED_ORIGINS?
2. Did you restart backend after changing ALLOWED_ORIGINS?
3. Is there a trailing slash? (remove it)
4. Are there spaces in ALLOWED_ORIGINS? (remove them)

# Example:
# ❌ ALLOWED_ORIGINS="http://localhost:5173, https://app.com"
# ✅ ALLOWED_ORIGINS="http://localhost:5173,https://app.com"
```

### "Cannot connect to backend"
```bash
# Check:
1. Is VITE_BACKEND_URL correct?
2. Is backend deployed and running?
3. Is VITE_API_KEY correct?
4. Did you redeploy frontend after changing variables?

# Test backend:
curl https://your-backend-url/health
```

### "AI Agent not detecting burns"
```bash
# Check:
1. Is APP_ID correct?
2. Is ENTERPRISE_API_URL correct (with full path)?
3. Is ENTERPRISE_API_KEY correct?
4. Check AI agent logs for errors

# Test enterprise API:
curl -X POST https://your-enterprise-url/api/v1/delete-user-data \
  -H "x-api-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test"}'
```

---

## 📝 Template Files

All services include `.env.example` files with templates:

- `frontend/backend-relayer/.env.example`
- `frontend/.env.example`
- `agent-api/.env.example`
- `enterprise-api/.env.example` (optional)

**To use:**
```bash
cp .env.example .env
# Edit .env with your values
```

---

## 🔄 Updating Variables

### Local Development
1. Edit `.env` file
2. Restart the service
3. Changes take effect immediately

### Production (Railway/Render)
1. Update variable in dashboard
2. Service automatically restarts
3. Changes take effect in ~30 seconds

### Production (Netlify/Vercel)
1. Update variable in dashboard
2. **Must redeploy** for changes to take effect
3. Trigger redeploy manually or push to Git

---

**Need help?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for full deployment instructions.
