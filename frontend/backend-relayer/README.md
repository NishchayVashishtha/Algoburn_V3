# AlgoBurn Backend Relayer

Secure backend service for signing Algorand transactions. This keeps the relayer mnemonic safe on the server instead of exposing it in the frontend.

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
```bash
APP_ID=758657427
RELAYER_MNEMONIC="your 25 word mnemonic here"
API_KEY="dev-key-change-in-production"
ALLOWED_ORIGINS="http://localhost:5173"
PORT=3001
```

### 3. Run the Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 4. Test the API

Health check:
```bash
curl http://localhost:3001/health
```

Diagnostics (requires API key):
```bash
curl -H "x-api-key: dev-key-change-in-production" \
     http://localhost:3001/api/diagnostics
```

## 📡 API Endpoints

### `GET /health`
Health check endpoint (no auth required)

**Response:**
```json
{
  "status": "ok",
  "service": "AlgoBurn Relayer",
  "relayerAddress": "YOUR_ADDRESS",
  "appId": 758657427
}
```

### `GET /api/diagnostics`
Check relayer account balance and app status

**Headers:** `x-api-key: your-api-key`

**Response:**
```json
{
  "success": true,
  "diagnostics": {
    "appId": 758657427,
    "appExists": true,
    "accountAddress": "YOUR_ADDRESS",
    "accountBalance": 1000000,
    "errors": []
  }
}
```

### `POST /api/mint-consent`
Mint a new consent NFT

**Headers:** `x-api-key: your-api-key`

**Response:**
```json
{
  "success": true,
  "txId": "TRANSACTION_ID",
  "assetId": 123456,
  "confirmedRound": 12345,
  "explorerUrl": "https://testnet.explorer.perawallet.app/tx/..."
}
```

### `POST /api/claim-consent`
Claim (transfer) a consent NFT to the relayer

**Headers:** `x-api-key: your-api-key`

**Body:**
```json
{
  "assetId": 123456
}
```

### `POST /api/burn-consent`
Burn (destroy) a consent NFT

**Headers:** `x-api-key: your-api-key`

**Body:**
```json
{
  "assetId": 123456
}
```

## 🔐 Security

- **Never commit `.env` file** - it contains your mnemonic
- **Use strong API keys in production** - not "dev-key-change-in-production"
- **Restrict CORS origins** - only allow your frontend domains
- **Keep dependencies updated** - run `npm audit` regularly

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) for full deployment instructions.

### Quick Deploy to Railway

1. Push to GitHub
2. Create new Railway project
3. Connect GitHub repo
4. Set root directory to `frontend/backend-relayer`
5. Add environment variables
6. Deploy!

### Quick Deploy to Render

1. Create new Web Service
2. Connect GitHub repo
3. Set root directory to `frontend/backend-relayer`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables
7. Deploy!

## 🐛 Troubleshooting

### "Invalid RELAYER_MNEMONIC"
- Make sure you copied the full 25-word mnemonic
- Check for extra spaces or quotes
- Verify the mnemonic is valid using AlgoKit or Pera Wallet

### "Insufficient balance"
- Fund your relayer account with at least 0.1 ALGO
- Use the Algorand Testnet dispenser: https://bank.testnet.algorand.network/

### "APP_ID does not exist"
- Verify the APP_ID is correct (758657427 for testnet)
- Check you're using the testnet endpoints, not mainnet

### CORS errors
- Add your frontend URL to `ALLOWED_ORIGINS`
- Restart the server after changing environment variables
- Check the frontend is using the correct backend URL
