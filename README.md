# 🔥 AlgoBurn - Blockchain-Powered Data Consent Management

> **DPDP Act Compliant** | **Algorand Blockchain** | **AI-Powered Automation**

AlgoBurn is a decentralized consent management system that uses **SoulBound Tokens (SBTs)** on the Algorand blockchain to enforce user data privacy rights. When a user revokes consent, an AI agent automatically triggers enterprise data deletion — making GDPR/DPDP compliance unstoppable and verifiable.

---

## 🎯 The Problem

Traditional consent management is just a checkbox in a database. Companies can ignore it. Users have no proof. Regulators can't verify compliance.

**AlgoBurn solves this by:**
- ✅ Recording consent on an immutable blockchain
- ✅ Making revocation automatic and unstoppable
- ✅ Providing cryptographic proof of compliance
- ✅ Eliminating trust requirements

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  USER INTERFACE (React + Vite)                          │
│  - Grant consent → Mint NFT                             │
│  - Revoke consent → Burn NFT                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├──► Backend Relayer (Node.js)
                 │    - Signs transactions securely
                 │    - No private keys in frontend
                 │
                 ├──► Algorand Smart Contract (PuyaPy)
                 │    - mint_consent() → Creates SBT
                 │    - burn_consent() → Destroys SBT
                 │    - Emits ConsentRevoked event
                 │
                 ├──► AI Agent (Python)
                 │    - Monitors blockchain 24/7
                 │    - Detects burn events in ~5 seconds
                 │    - Triggers enterprise API
                 │
                 └──► Enterprise API (Node.js)
                      - Receives purge requests
                      - Deletes user data
                      - Logs compliance actions
```

---

## 🚀 Features

### For Users
- **One-Click Consent**: Grant data access by minting an NFT
- **Instant Revocation**: Burn the NFT to revoke consent
- **Cryptographic Proof**: Every action is recorded on-chain
- **No Trust Required**: Smart contracts enforce the rules

### For Enterprises
- **Automatic Compliance**: AI agent handles data deletion
- **Audit Trail**: All actions logged on blockchain
- **DPDP/GDPR Ready**: Built for regulatory compliance
- **Easy Integration**: Simple REST API

### Technical
- **SoulBound Tokens**: Non-transferable NFTs as consent proof
- **Real-Time Monitoring**: AI agent detects burns in ~5 seconds
- **Secure Architecture**: Private keys never exposed to frontend
- **Production Ready**: Deployment configs for Railway, Render, Netlify

---

## 📦 Project Structure

```
algoburn/
├── frontend/                    # React + Vite UI
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── algorandService.js  # Backend API client
│   │   └── App.jsx             # Main app
│   ├── backend-relayer/        # Secure transaction signing service
│   │   ├── server.js           # Express API
│   │   └── package.json
│   ├── netlify.toml            # Netlify deployment config
│   └── vercel.json             # Vercel deployment config
│
├── contracts/                   # Algorand smart contracts
│   └── Algoburn/
│       └── projects/Algoburn/
│           └── contracts/
│               └── algo_burn.py # PuyaPy smart contract
│
├── agent-api/                   # AI monitoring agent
│   ├── agent.py                # Blockchain monitor
│   ├── requirements.txt
│   ├── railway.toml            # Railway deployment
│   └── render.yaml             # Render deployment
│
├── enterprise-api/              # Mock enterprise backend
│   ├── server.js               # Express API
│   └── public/                 # Admin dashboard
│
├── algoburn-sdk/               # Reusable SDK
│   └── index.js                # AlgoBurn SDK
│
├── credlyy-app/                # Demo fintech app
│   ├── credlyy_frontend/       # React UI
│   └── credlyy-backend/        # Node.js API
│
└── DEPLOYMENT_GUIDE.md         # 👈 START HERE FOR DEPLOYMENT
```

---

## 🎬 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Algorand account with testnet ALGO
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/algoburn.git
cd algoburn
```

### 2. Setup Backend Relayer
```bash
cd frontend/backend-relayer
npm install
cp .env.example .env
# Edit .env with your mnemonic and API key
npm start
```

### 3. Setup Frontend
```bash
cd ../  # back to frontend/
npm install
cp .env.example .env.local
# Edit .env.local with backend URL and API key
npm run dev
```

### 4. Setup AI Agent
```bash
cd ../../agent-api
pip install -r requirements.txt
cp .env.example .env
# Edit .env with enterprise API URL
python agent.py
```

### 5. Setup Enterprise API
```bash
cd ../enterprise-api
npm install
npm start
```

### 6. Test the Flow
1. Open http://localhost:5173
2. Login with any test email
3. Click "Grant Consent" → NFT minted
4. Click "Revoke Consent" → NFT burned
5. Check enterprise API → User data purged

---

## 🌐 Deployment

**See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.**

### Quick Deploy Summary

1. **Backend Relayer** → Railway/Render (Node.js)
2. **Frontend** → Netlify/Vercel (Static)
3. **AI Agent** → Railway/Render (Python Worker)
4. **Enterprise API** → Railway (Node.js)

**Estimated Time:** 30 minutes  
**Cost:** $0/month (free tiers)

---

## 🔐 Security

### ✅ What We Do Right
- Private keys stored only in backend
- API key authentication
- CORS restrictions
- Environment variables for secrets
- No sensitive data in frontend code

### ⚠️ Production Checklist
- [ ] Change all API keys from defaults
- [ ] Use strong random API keys
- [ ] Restrict CORS to your domains only
- [ ] Enable HTTPS everywhere
- [ ] Monitor backend logs
- [ ] Set up error tracking (Sentry)
- [ ] Regular security audits

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Algorand Python (PuyaPy) |
| **Blockchain** | Algorand Testnet |
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express |
| **AI Agent** | Python, algosdk |
| **Database** | PostgreSQL (Credlyy), In-Memory (Enterprise API) |
| **Deployment** | Railway, Render, Netlify, Vercel |

---

## 📊 How It Works

### 1. Grant Consent (Mint NFT)
```
User clicks "Grant Consent"
    ↓
Frontend calls Backend Relayer API
    ↓
Backend signs transaction with private key
    ↓
Smart contract creates SoulBound Token (SBT)
    ↓
NFT transferred to user's wallet
    ↓
User now has cryptographic proof of consent
```

### 2. Revoke Consent (Burn NFT)
```
User clicks "Revoke Consent"
    ↓
Frontend calls Backend Relayer API
    ↓
Backend signs burn transaction
    ↓
Smart contract claws back NFT and destroys it
    ↓
ConsentRevoked event emitted on-chain
    ↓
AI Agent detects event within 5 seconds
    ↓
AI Agent calls Enterprise API with proof
    ↓
Enterprise API purges user data
    ↓
Compliance achieved automatically
```

---

## 🎓 Use Cases

### 1. Fintech (Credlyy Demo)
- Users apply for loans with sensitive data
- Consent recorded as NFT
- User can revoke and force data deletion
- Audit trail for regulators

### 2. Healthcare
- Patient consent for medical records
- Revoke access to specific providers
- HIPAA compliance automation

### 3. Social Media
- User data collection consent
- One-click data deletion
- GDPR Article 17 compliance

### 4. E-Commerce
- Marketing consent management
- Customer data portability
- Right to be forgotten

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Algorand Foundation** - For the blockchain infrastructure
- **AlgoKit** - For development tools
- **Puya Compiler** - For Python → TEAL compilation
- **Railway/Render** - For hosting infrastructure

---

## 📞 Support

- **Documentation**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/algoburn/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/algoburn/discussions)

---

## 🎯 Roadmap

- [ ] Mainnet deployment
- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Mobile app (React Native)
- [ ] Enterprise dashboard
- [ ] Compliance reporting tools
- [ ] Integration with major CRMs
- [ ] Automated legal document generation

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ for a more private internet**
