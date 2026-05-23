# ✅ AlgoBurn Deployment Checklist

Use this checklist to ensure a smooth deployment.

---

## 📋 Pre-Deployment

### Local Testing
- [ ] Backend relayer runs locally (`npm start` in `frontend/backend-relayer`)
- [ ] Frontend runs locally (`npm run dev` in `frontend`)
- [ ] AI agent runs locally (`python agent.py` in `agent-api`)
- [ ] Enterprise API runs locally (`npm start` in `enterprise-api`)
- [ ] Full flow works: mint → claim → burn → verify purge

### Code Preparation
- [ ] All `.env` files are in `.gitignore`
- [ ] No private keys or mnemonics in code
- [ ] All `.env.example` files are up to date
- [ ] `README.md` and `DEPLOYMENT_GUIDE.md` are accurate
- [ ] Code is committed and pushed to GitHub

### Account Setup
- [ ] Relayer account has at least 0.1 ALGO on testnet
- [ ] Smart contract is deployed (APP_ID: 758657427)
- [ ] Railway/Render/Netlify accounts created

---

## 🚀 Deployment Order

### Step 1: Backend Relayer (FIRST!)
- [ ] Deployed to Railway/Render/Vercel
- [ ] Environment variables set:
  - [ ] `APP_ID=758657427`
  - [ ] `RELAYER_MNEMONIC` (your 25 words)
  - [ ] `API_KEY` (strong random key)
  - [ ] `ALLOWED_ORIGINS` (will update after frontend deploy)
  - [ ] `PORT=3001`
- [ ] Health check works: `curl https://your-relayer.railway.app/health`
- [ ] Diagnostics work: `curl -H "x-api-key: YOUR_KEY" https://your-relayer.railway.app/api/diagnostics`
- [ ] **Copy the public URL** → You'll need this for frontend

### Step 2: Enterprise API
- [ ] Deployed to Railway
- [ ] Environment variables set:
  - [ ] `API_KEY=algoburn-dev-key`
  - [ ] `PORT=3000`
- [ ] Users endpoint works: `curl https://your-enterprise.railway.app/api/v1/users`
- [ ] **Copy the public URL** → You'll need this for AI agent

### Step 3: AI Agent
- [ ] Deployed to Railway/Render as a worker
- [ ] Environment variables set:
  - [ ] `APP_ID=758657427`
  - [ ] `INDEXER_URL=https://testnet-idx.algonode.cloud`
  - [ ] `ENTERPRISE_API_URL` (from Step 2)
  - [ ] `ENTERPRISE_API_KEY=algoburn-dev-key`
- [ ] Logs show: "🤖 ALGOBURN AI AGENT ACTIVATED"
- [ ] Logs show: "👀 Scanning blockchain..."

### Step 4: Frontend
- [ ] Deployed to Netlify/Vercel
- [ ] Build settings correct:
  - [ ] Base directory: `frontend`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `frontend/dist`
- [ ] Environment variables set:
  - [ ] `VITE_BACKEND_URL` (from Step 1)
  - [ ] `VITE_API_KEY` (same as backend relayer)
- [ ] Site loads without errors
- [ ] **Copy the public URL** → You'll need this for CORS

### Step 5: Update CORS
- [ ] Go back to Backend Relayer deployment
- [ ] Update `ALLOWED_ORIGINS` to include frontend URL
- [ ] Example: `http://localhost:5173,https://algoburn.netlify.app`
- [ ] Restart backend relayer service

---

## 🧪 Post-Deployment Testing

### Backend Relayer
- [ ] Health check returns 200 OK
- [ ] Diagnostics shows correct app ID and relayer address
- [ ] Diagnostics shows sufficient balance (>0.1 ALGO)
- [ ] Diagnostics shows app exists

### Frontend
- [ ] Site loads without console errors
- [ ] Login page displays correctly
- [ ] Can navigate through all screens

### Full Flow Test
- [ ] Login with test email
- [ ] Click "Grant Consent"
  - [ ] Loading state shows
  - [ ] Success message appears
  - [ ] Asset ID is displayed
  - [ ] Explorer link works
- [ ] Click "Revoke Consent"
  - [ ] Loading state shows
  - [ ] Success message appears
  - [ ] Transaction ID is displayed
- [ ] Check Enterprise API
  - [ ] User status changed to "Purged"
  - [ ] User data shows "[REDACTED]"
- [ ] Check AI Agent logs
  - [ ] Shows "🚨 ALERT: Burn Detected"
  - [ ] Shows "✅ Mission accomplished"

### Performance
- [ ] Frontend loads in <3 seconds
- [ ] Mint transaction completes in <10 seconds
- [ ] Burn transaction completes in <10 seconds
- [ ] AI agent detects burn in <10 seconds
- [ ] Enterprise API responds in <1 second

---

## 🔐 Security Verification

### Secrets Management
- [ ] No `.env` files committed to Git
- [ ] No mnemonics in frontend code
- [ ] No mnemonics in browser DevTools
- [ ] API keys are strong random strings (not "dev-key")
- [ ] All secrets stored in platform environment variables

### CORS Configuration
- [ ] Backend only allows specific frontend origins
- [ ] No `*` wildcard in production ALLOWED_ORIGINS
- [ ] CORS errors don't appear in browser console

### API Security
- [ ] All backend endpoints require API key
- [ ] API key is sent in headers, not URL
- [ ] Unauthorized requests return 401

### Network Security
- [ ] All services use HTTPS (not HTTP)
- [ ] No mixed content warnings
- [ ] SSL certificates valid

---

## 📊 Monitoring Setup

### Logs
- [ ] Backend relayer logs accessible
- [ ] AI agent logs accessible
- [ ] Enterprise API logs accessible
- [ ] Frontend build logs accessible

### Alerts (Optional but Recommended)
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (Papertrail, Logtail)

---

## 📝 Documentation

### URLs Documented
- [ ] Frontend URL saved
- [ ] Backend relayer URL saved
- [ ] Enterprise API URL saved
- [ ] All URLs shared with team

### Credentials Secured
- [ ] API keys stored in password manager
- [ ] Relayer mnemonic backed up securely
- [ ] Platform login credentials saved
- [ ] Emergency access documented

### Handoff
- [ ] Team trained on deployment process
- [ ] Troubleshooting guide shared
- [ ] Support contacts documented
- [ ] Runbook created for common issues

---

## 🎉 Launch

### Final Checks
- [ ] All tests passing
- [ ] All services healthy
- [ ] All URLs working
- [ ] All documentation complete

### Go Live
- [ ] Announce to team
- [ ] Share frontend URL
- [ ] Monitor for first 24 hours
- [ ] Collect user feedback

### Post-Launch
- [ ] Monitor error rates
- [ ] Check transaction success rates
- [ ] Verify AI agent is detecting burns
- [ ] Review logs for issues

---

## 🐛 Rollback Plan

If something goes wrong:

1. **Frontend Issues**
   - Revert to previous Netlify/Vercel deployment
   - Check environment variables
   - Clear CDN cache

2. **Backend Issues**
   - Check Railway/Render logs
   - Verify environment variables
   - Restart service
   - Revert to previous deployment if needed

3. **AI Agent Issues**
   - Check logs for errors
   - Verify enterprise API URL is correct
   - Restart worker
   - Temporarily disable if critical

4. **Emergency Contacts**
   - Platform support: Railway, Render, Netlify
   - Team lead: [Your contact]
   - DevOps: [Your contact]

---

## 📞 Support Resources

- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Main README**: [README.md](./README.md)
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Algorand Docs**: https://developer.algorand.org

---

**Last Updated**: [Add date when you deploy]  
**Deployed By**: [Your name]  
**Deployment Date**: [Add date]
