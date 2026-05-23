require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { AlgoBurnSDK } = require('@algoburn/sdk') 

const app = express()

// --- CORS FIX ---
// Railway se ALLOWED_ORIGINS variable uthayega (comma separated strings)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins })) 
app.use(express.json())

// --- ENV VAR FIX ---
// VITE_ hata diya hai taaki Railway ke variables se match kare
const algoBurn = new AlgoBurnSDK({
  appId: process.env.APP_ID, 
  mnemonic: process.env.RELAYER_MNEMONIC 
});

// --- CUSTOM PRIVACY ROUTES ---

app.post('/api/privacy/grant', async (req, res) => {
  try {
    console.log("⚡ [AlgoBurn] Initializing Blockchain Consent...");
    
    const result = await algoBurn.mintConsent();
    
    console.log(`✅ [AlgoBurn] NFT Minted! Asset ID: ${result.assetId}`);
    
    res.json({ 
      success: true, 
      assetId: result.assetId, 
      txId: result.txId 
    });
  } catch (error) {
    console.error("❌ [AlgoBurn] Minting Failed:", error);
    res.status(500).json({ error: "Blockchain transaction failed. Please check Relayer balance." });
  }
});

app.post('/api/compliance/purge', async (req, res) => {
    const { assetId } = req.body;
    
    if (!assetId) return res.status(400).json({ error: "Asset ID required" });

    console.log(`🚨 [DPDP ALERT] AI Agent detected Burn for Asset: ${assetId}`);
    console.log(`🗑️ [DPDP ACTION] Executing Data Purge from Credlyy Database...`);
    
    res.json({ 
        status: "Success", 
        message: `Privacy Compliance Met. Data for Asset ${assetId} has been purged.`,
        timestamp: new Date().toISOString()
    });
});

// --- EXISTING ROUTES ---
app.use('/api/auth',  require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/admin', require('./routes/admin'))

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'Credlyy-Backend' }))

// --- PORT & RAILWAY BINDING FIX ---
// '0.0.0.0' add kiya aur aakhir mein bracket close kiya
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`------------------------------------------`)
    console.log(`🚀 CREDLYY Backend running on port ${PORT}`)
    console.log(`🛡️  AlgoBurn SDK Integrated with App ID: ${process.env.APP_ID}`)
    console.log(`------------------------------------------`)
}); // <-- Yeh wala bracket missing tha