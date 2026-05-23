# 🚀 AlgoBurn Deployment Guide

This guide will walk you through deploying the entire AlgoBurn system to production.

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  NETLIFY/VERCEL (Static Frontend)                       │
│  - React + Vite                                         │
│  - No private keys exposed                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├──► Railway/Render: Backend Relayer (Node.js)
                 │    - Signs transactions securely
                 │    - Holds the mnemonic
                 │
                 ├──► Railway: Enterprise API (Node.js)
                 │    - Mock enterprise database
                 │
                 └──► Railway/Render: AI Agent (Python)
                      - Monitors blockchain 24/7
                      - Triggers data purges
                           │
                           └──► Algorand Testnet
```

---

## 🎯 Deployment Steps

### **Step 1: Deploy Backend Relayer** (MUST DO FIRST)

The backend relayer signs transactions and must be deployed before the frontend.

#### Option A: Railway (Recommended)

1. **Create Railway Account**: https://railway.app
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select your repo** → Choose `frontend/backend-relayer` as root directory
4. **Set Environment Variables**:
   ```
   APP_ID=758657427
   RELAYER_MNEMONIC=your 25 word mnemonic here
   API_KEY=generate-a-secure-random-key-here
   ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.netlify.app
   PORT=3001
   ```
5. **Deploy** → Railway will auto-detect Node.js and deploy
6. **Copy the public URL** (e.g., `https://algoburn-relayer.railway.app`)

#### Option B: Render

1. Go to https://render.com
2. **New** → **Web Service**
3. Connect your GitHub repo
4. **Root Directory**: `frontend/backend-relayer`
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`
7. Set the same environment variables as above
8. Deploy and copy the URL

#### Option C: Vercel

```bash
cd frontend/backend-relayer
npm install -g vercel
vercel
# Follow prompts, then set environment variables in Vercel dashboard
```

---

### **Step 2: Deploy Enterprise API**

This is already deployed on Railway based on your `railway.toml`, but here's how to redeploy:

1. **Railway Dashboard** → New Project
2. **Deploy from GitHub** → Select `enterprise-api` folder
3. **Set Environment Variables**:
   ```
   API_KEY=algoburn-dev-key
   PORT=3000
   ```
4. Deploy and copy the URL (e.g., `https://algoburn-enterprise.railway.app`)

---

### **Step 3: Deploy AI Agent**

The AI agent needs to run 24/7 as a background worker.

#### Railway (Recommended for Workers)

1. **Railway Dashboard** → New Project
2. **Deploy from GitHub** → Select `agent-api` folder
3. **Set Environment Variables**:
   ```
   APP_ID=758657427
   INDEXER_URL=https://testnet-idx.algonode.cloud
   ENTERPRISE_API_URL=https://algoburn-enterprise.railway.app/api/v1/delete-user-data
   ENTERPRISE_API_KEY=algoburn-dev-key
   ```
4. Deploy → Railway will detect Python and run `python agent.py`

#### Render

1. **New** → **Background Worker**
2. Connect repo → Root: `agent-api`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `python agent.py`
5. Set environment variables
6. Deploy

---

### **Step 4: Deploy Frontend**

Now that all backends are running, deploy the frontend.

#### Option A: Netlify (Recommended)

1. **Create Netlify Account**: https://netlify.com
2. **New Site** → "Import from Git"
3. **Select your repo**
4. **Build Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. **Environment Variables** (in Netlify dashboard):
   ```
   VITE_BACKEND_URL=https://algoburn-relayer.railway.app
   VITE_API_KEY=your-secure-api-key-from-step-1
   ```
6. **Deploy** → Netlify will build and deploy
7. **Copy your site URL** (e.g., `https://algoburn.netlify.app`)

#### Option B: Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

Then set environment variables in Vercel dashboard:
- `VITE_BACKEND_URL`
- `VITE_API_KEY`

---

### **Step 5: Update CORS Origins**

Go back to your **Backend Relayer** deployment and update the `ALLOWED_ORIGINS` environment variable:

```
ALLOWED_ORIGINS=http://localhost:5173,https://algoburn.netlify.app
```

Replace `algoburn.netlify.app` with your actual Netlify URL.

**Restart the backend relayer** after updating.

---

## ✅ Verification Checklist

After deployment, verify everything works:

### 1. Backend Relayer Health Check
```bash
curl https://algoburn-relayer.railway.app/health
```
Should return:
```json
{
  "status": "ok",
  "service": "AlgoBurn Relayer",
  "relayerAddress": "YOUR_ADDRESS",
  "appId": 758657427
}
```

### 2. Enterprise API Health Check
```bash
curl https://algoburn-enterprise.railway.app/api/v1/users
```
Should return a list of users.

### 3. AI Agent Logs
Check Railway/Render logs for:
```
🤖 ALGOBURN AI AGENT ACTIVATED
📡 Monitoring App ID 758657427 on Algorand TestNet...
👀 Scanning blockchain...
```

### 4. Frontend Test
1. Open your Netlify URL
2. Login with any test email
3. Click "Grant Consent" → Should mint an NFT
4. Check the transaction on Algorand Explorer
5. Click "Revoke Consent" → Should burn the NFT
6. Within 5-10 seconds, check Enterprise API → User should be marked as "Purged"

---

## 🔐 Security Checklist

- [ ] `RELAYER_MNEMONIC` is ONLY in backend relayer environment variables
- [ ] `RELAYER_MNEMONIC` is NOT in frontend code or `.env` files
- [ ] `API_KEY` is a strong random string (not "dev-key-change-in-production")
- [ ] `ALLOWED_ORIGINS` only includes your actual frontend URLs
- [ ] `.env` files are in `.gitignore`
- [ ] No private keys committed to Git

---

## 🌐 Production URLs Template

After deployment, you'll have these URLs:

| Service | URL | Example |
|---------|-----|---------|
| Frontend | `https://your-app.netlify.app` | User interface |
| Backend Relayer | `https://algoburn-relayer.railway.app` | Transaction signing |
| Enterprise API | `https://algoburn-enterprise.railway.app` | Mock enterprise DB |
| AI Agent | (no public URL - background worker) | Blockchain monitor |

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `VITE_BACKEND_URL` is set correctly
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Check backend relayer is running (visit `/health` endpoint)

### Transactions failing
- Check relayer account has sufficient ALGO balance (min 0.1 ALGO)
- Check `APP_ID` is correct (758657427)
- Check backend relayer logs for errors

### AI Agent not detecting burns
- Check `APP_ID` matches your smart contract
- Check `ENTERPRISE_API_URL` is correct
- Check `ENTERPRISE_API_KEY` matches the enterprise API
- Check agent logs for errors

### CORS errors
- Update `ALLOWED_ORIGINS` in backend relayer
- Restart backend relayer after updating
- Clear browser cache

---

## 💰 Cost Estimate

| Service | Free Tier | Cost After Free Tier |
|---------|-----------|---------------------|
| Netlify | 100GB bandwidth/month | $19/month |
| Railway | $5 credit/month | $0.000231/GB-hour |
| Render | 750 hours/month | $7/month per service |
| Vercel | 100GB bandwidth/month | $20/month |

**Recommended for free hosting:**
- Frontend: Netlify (free tier)
- Backend Relayer: Railway (free $5 credit)
- Enterprise API: Railway (free $5 credit)
- AI Agent: Railway (free $5 credit)

**Total: $0/month** (within free tiers)

---

## 📝 Environment Variables Reference

### Backend Relayer
```bash
APP_ID=758657427
RELAYER_MNEMONIC="your 25 word mnemonic"
API_KEY="secure-random-key"
ALLOWED_ORIGINS="https://your-frontend.netlify.app"
PORT=3001
```

### Frontend
```bash
VITE_BACKEND_URL="https://algoburn-relayer.railway.app"
VITE_API_KEY="same-as-backend-api-key"
```

### AI Agent
```bash
APP_ID=758657427
INDEXER_URL="https://testnet-idx.algonode.cloud"
ENTERPRISE_API_URL="https://algoburn-enterprise.railway.app/api/v1/delete-user-data"
ENTERPRISE_API_KEY="algoburn-dev-key"
```

### Enterprise API
```bash
API_KEY="algoburn-dev-key"
PORT=3000
```

---

## 🎉 You're Done!

Your AlgoBurn system is now fully deployed and production-ready!

**Next Steps:**
- Share your frontend URL with users
- Monitor backend logs for any issues
- Test the full flow: mint → claim → burn → verify purge
- Consider adding monitoring/alerting (e.g., Sentry, LogRocket)

**Need Help?**
- Check service logs in Railway/Render/Netlify dashboards
- Verify all environment variables are set correctly
- Test each service independently using the verification checklist above
