# 🚀 AlgoBurn - Simple Deployment Steps

**Quick reference for deploying AlgoBurn to production.**

---

## ⏱️ Time Required: 30 minutes

## 💰 Cost: $0/month (free tiers)

---

## 📋 Prerequisites

Before starting, have these ready:

- [ ] GitHub account
- [ ] Railway account (https://railway.app)
- [ ] Netlify account (https://netlify.com)
- [ ] Your Algorand relayer mnemonic (25 words)
- [ ] Relayer account funded with 0.1+ ALGO on testnet

---

## 🎯 Deployment Steps

### Step 1: Deploy Backend Relayer (10 min)

**Platform:** Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your AlgoBurn repository
4. Click "Add variables" and set:
   ```
   APP_ID = 758657427
   RELAYER_MNEMONIC = your 25 word mnemonic here
   API_KEY = generate-a-secure-random-key
   ALLOWED_ORIGINS = http://localhost:5173
   PORT = 3001
   ```
5. Set root directory: `frontend/backend-relayer`
6. Click "Deploy"
7. Wait for deployment to complete (~2 min)
8. **Copy the public URL** (e.g., `https://algoburn-relayer.railway.app`)
9. Test: Visit `https://your-url/health` - should show JSON

**Generate API Key:**
```bash
# Run this in your terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 2: Deploy Enterprise API (5 min)

**Platform:** Railway

1. In Railway, click "New Project" → "Deploy from GitHub repo"
2. Select your AlgoBurn repository
3. Click "Add variables" and set:
   ```
   API_KEY = algoburn-dev-key
   PORT = 3000
   ```
4. Set root directory: `enterprise-api`
5. Click "Deploy"
6. Wait for deployment (~2 min)
7. **Copy the public URL** (e.g., `https://algoburn-enterprise.railway.app`)
8. Test: Visit `https://your-url/api/v1/users` - should show user list

---

### Step 3: Deploy AI Agent (5 min)

**Platform:** Railway

1. In Railway, click "New Project" → "Deploy from GitHub repo"
2. Select your AlgoBurn repository
3. Click "Add variables" and set:
   ```
   APP_ID = 758657427
   INDEXER_URL = https://testnet-idx.algonode.cloud
   ENTERPRISE_API_URL = https://algoburn-enterprise.railway.app/api/v1/delete-user-data
   ENTERPRISE_API_KEY = algoburn-dev-key
   ```
   (Replace `algoburn-enterprise.railway.app` with your URL from Step 2)
4. Set root directory: `agent-api`
5. Click "Deploy"
6. Wait for deployment (~2 min)
7. Check logs - should show: "🤖 ALGOBURN AI AGENT ACTIVATED"

---

### Step 4: Deploy Frontend (5 min)

**Platform:** Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your AlgoBurn repository
4. Set build settings:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
5. Click "Add environment variables" and set:
   ```
   VITE_BACKEND_URL = https://algoburn-relayer.railway.app
   VITE_API_KEY = your-api-key-from-step-1
   ```
   (Replace with your backend relayer URL from Step 1)
6. Click "Deploy site"
7. Wait for deployment (~3 min)
8. **Copy your site URL** (e.g., `https://algoburn.netlify.app`)

---

### Step 5: Update CORS (2 min)

**Platform:** Railway (Backend Relayer)

1. Go back to your Backend Relayer project in Railway
2. Click "Variables"
3. Find `ALLOWED_ORIGINS`
4. Update to include your Netlify URL:
   ```
   ALLOWED_ORIGINS = http://localhost:5173,https://algoburn.netlify.app
   ```
   (Replace `algoburn.netlify.app` with your URL from Step 4)
5. Service will automatically restart (~30 seconds)

---

### Step 6: Test Everything (3 min)

1. **Open your Netlify URL** (from Step 4)
2. **Login** with test email: `amit@test.com`
3. **Grant Consent**:
   - Click "Grant Consent" button
   - Wait 5-10 seconds
   - Should see: "✅ Consent NFT Minted!"
   - Note the Asset ID
4. **Revoke Consent**:
   - Click "Revoke Consent" button
   - Wait 5-10 seconds
   - Should see: "✅ Consent Revoked!"
5. **Verify Purge**:
   - Open your Enterprise API URL (from Step 2)
   - Find the user in the table
   - Status should be "Purged"
   - Email/Name should show "[REDACTED]"
6. **Check AI Agent**:
   - Go to Railway → AI Agent project → Logs
   - Should show: "🚨 ALERT: Burn Detected"

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Backend Relayer health check works
- [ ] Enterprise API shows user list
- [ ] AI Agent logs show "ALGOBURN AI AGENT ACTIVATED"
- [ ] Frontend loads without errors
- [ ] Can mint NFT successfully
- [ ] Can burn NFT successfully
- [ ] AI Agent detects burn
- [ ] Enterprise API purges data

---

## 🎉 You're Done!

Your AlgoBurn system is now live!

**Your URLs:**
- Frontend: `https://your-app.netlify.app`
- Backend Relayer: `https://your-relayer.railway.app`
- Enterprise API: `https://your-enterprise.railway.app`
- AI Agent: (background worker, no public URL)

---

## 🐛 Quick Troubleshooting

### Frontend can't connect to backend
- Check `VITE_BACKEND_URL` in Netlify environment variables
- Check `VITE_API_KEY` matches backend `API_KEY`
- Redeploy frontend after changing variables

### CORS error in browser
- Check `ALLOWED_ORIGINS` includes your Netlify URL
- Make sure there are no spaces in the comma-separated list
- Restart backend relayer after updating

### Transactions failing
- Check relayer account has 0.1+ ALGO
- Check `APP_ID` is correct (758657427)
- Check backend relayer logs for errors

### AI Agent not detecting burns
- Check `ENTERPRISE_API_URL` is correct (with full path)
- Check `ENTERPRISE_API_KEY` matches enterprise API
- Check AI Agent logs for errors

---

## 📚 Full Documentation

For detailed information, see:

- **Complete Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Environment Variables**: [ENV_VARIABLES_GUIDE.md](./ENV_VARIABLES_GUIDE.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 💡 Tips

- **Save your URLs**: Keep a note of all deployed URLs
- **Monitor logs**: Check Railway logs regularly for errors
- **Test thoroughly**: Run through the full flow multiple times
- **Update documentation**: Add your specific URLs to your team docs

---

## 🔐 Security Reminders

- ✅ Never commit `.env` files
- ✅ Use strong API keys (not "dev-key")
- ✅ Restrict CORS to your domains only
- ✅ Keep your mnemonic safe
- ✅ Monitor for suspicious activity

---

**Need help?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting.
