# ⚡ AlgoBurn Quick Start Guide

Get AlgoBurn running in 10 minutes!

---

## 🎯 What You'll Do

1. Setup environment files (2 min)
2. Install dependencies (3 min)
3. Start all services (1 min)
4. Test the full flow (4 min)

**Total Time: ~10 minutes**

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ Node.js 18+ installed
- ✅ Python 3.9+ installed
- ✅ Git installed
- ✅ A code editor (VS Code recommended)
- ✅ An Algorand testnet account with 0.1+ ALGO

**Don't have an Algorand account?**
1. Install [Pera Wallet](https://perawallet.app/)
2. Create account and switch to Testnet
3. Get free ALGO: https://bank.testnet.algorand.network/

---

## 🚀 Setup (One-Time)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/algoburn.git
cd algoburn
```

### Step 2: Configure Backend Relayer

```bash
cd frontend/backend-relayer
cp .env.example .env
```

Edit `.env` and set:
```bash
APP_ID=758657427
RELAYER_MNEMONIC="your 25 word mnemonic from Pera Wallet"
API_KEY="my-secret-key-123"
ALLOWED_ORIGINS="http://localhost:5173"
PORT=3001
```

Install dependencies:
```bash
npm install
cd ../..
```

### Step 3: Configure Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` and set:
```bash
VITE_BACKEND_URL=http://localhost:3001
VITE_API_KEY=my-secret-key-123
```

Install dependencies:
```bash
npm install
cd ..
```

### Step 4: Configure AI Agent

```bash
cd agent-api
cp .env.example .env
```

Edit `.env` and set:
```bash
APP_ID=758657427
INDEXER_URL=https://testnet-idx.algonode.cloud
ENTERPRISE_API_URL=http://localhost:3000/api/v1/delete-user-data
ENTERPRISE_API_KEY=algoburn-dev-key
```

Install dependencies:
```bash
pip install -r requirements.txt
cd ..
```

### Step 5: Setup Enterprise API

```bash
cd enterprise-api
npm install
cd ..
```

---

## 🎬 Running AlgoBurn

### Option A: Automated Start (Recommended)

**Windows:**
```bash
start-local.bat
```

**Mac/Linux:**
```bash
chmod +x start-local.sh
./start-local.sh
```

This will open 4 terminal windows, one for each service.

### Option B: Manual Start

Open 4 separate terminals and run:

**Terminal 1 - Backend Relayer:**
```bash
cd frontend/backend-relayer
npm start
```

**Terminal 2 - Enterprise API:**
```bash
cd enterprise-api
npm start
```

**Terminal 3 - AI Agent:**
```bash
cd agent-api
python agent.py
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## ✅ Verify Everything Works

### 1. Check Services Are Running

Open these URLs in your browser:

- **Frontend**: http://localhost:5173 (should show login page)
- **Backend Relayer**: http://localhost:3001/health (should show JSON)
- **Enterprise API**: http://localhost:3000 (should show admin dashboard)

Check **AI Agent** terminal - should show:
```
🤖 ALGOBURN AI AGENT ACTIVATED
📡 Monitoring App ID 758657427 on Algorand TestNet...
👀 Scanning blockchain...
```

### 2. Test the Full Flow

1. **Open Frontend**: http://localhost:5173

2. **Login**: Enter any test email (e.g., `amit@test.com`)

3. **Grant Consent**:
   - Click "Grant Consent" button
   - Wait 5-10 seconds
   - You should see: "✅ Consent NFT Minted!"
   - Note the Asset ID

4. **Revoke Consent**:
   - Click "Revoke Consent" button
   - Wait 5-10 seconds
   - You should see: "✅ Consent Revoked!"

5. **Verify Data Purge**:
   - Open http://localhost:3000
   - Find the user in the table
   - Status should be "Purged"
   - Email and Name should show "[REDACTED]"

6. **Check AI Agent Logs**:
   - Look at the AI Agent terminal
   - Should show: "🚨 ALERT: Burn Detected for Asset ID: [your asset ID]"
   - Should show: "✅ Mission accomplished"

---

## 🎉 Success!

If all the above worked, congratulations! AlgoBurn is running locally.

**What just happened?**
1. You minted an NFT representing consent
2. You burned the NFT to revoke consent
3. The AI agent detected the burn on the blockchain
4. The enterprise API automatically purged the user's data
5. All of this happened in ~10 seconds with cryptographic proof

---

## 🐛 Troubleshooting

### "Invalid RELAYER_MNEMONIC"
- Make sure you copied all 25 words
- Check for extra spaces or quotes
- Verify it's a valid Algorand mnemonic

### "Insufficient balance"
- Your relayer account needs at least 0.1 ALGO
- Get free testnet ALGO: https://bank.testnet.algorand.network/
- Paste your relayer address (shown in backend logs)

### "Cannot connect to backend"
- Check backend relayer is running on port 3001
- Check `VITE_BACKEND_URL` in frontend `.env.local`
- Check `VITE_API_KEY` matches backend `API_KEY`

### "CORS error"
- Check `ALLOWED_ORIGINS` in backend `.env` includes `http://localhost:5173`
- Restart backend relayer after changing `.env`

### "AI Agent not detecting burns"
- Check `APP_ID` is correct (758657427)
- Check `ENTERPRISE_API_URL` is correct
- Check AI agent terminal for errors

### Port already in use
- Change ports in `.env` files:
  - Backend: `PORT=3002`
  - Enterprise: `PORT=3001`
  - Frontend: Edit `vite.config.js` to change port

---

## 📚 Next Steps

### Learn More
- Read [README.md](./README.md) for full project overview
- Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to deploy to production
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for deployment steps

### Customize
- Modify frontend UI in `frontend/src/components/`
- Add new smart contract methods in `contracts/Algoburn/projects/Algoburn/contracts/algo_burn.py`
- Customize AI agent logic in `agent-api/agent.py`
- Add real database to enterprise API

### Deploy
- Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Deploy to Railway, Render, Netlify (all have free tiers)
- Estimated time: 30 minutes
- Estimated cost: $0/month

---

## 💡 Tips

### Development Workflow
1. Make changes to code
2. Services auto-reload (except AI agent)
3. Test in browser
4. Check logs for errors

### Debugging
- Backend logs show all API requests
- AI agent logs show blockchain events
- Browser DevTools show frontend errors
- Enterprise API has admin dashboard at http://localhost:3000

### Testing
- Use different test emails to simulate multiple users
- Check Algorand Explorer for on-chain transactions
- Monitor AI agent logs to see real-time detection

---

## 🆘 Need Help?

- **Documentation**: Check other `.md` files in this repo
- **Issues**: Open a GitHub issue
- **Logs**: Check terminal outputs for error messages
- **Community**: Join Algorand Discord for blockchain questions

---

**Happy Building! 🔥**
