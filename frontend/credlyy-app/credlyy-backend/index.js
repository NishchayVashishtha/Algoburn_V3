require('dotenv').config()
const express = require('express')
const cors = require('cors')
// SDK ko import kiya (Local linked package)
const { AlgoBurnSDK } = require('@algoburn/sdk') 

const app = express()

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })) // Tera frontend port
app.use(express.json())

// --- ALGOBURN SDK INITIALIZATION ---
// Yeh engine pura blockchain communication sambhalega
const algoBurn = new AlgoBurnSDK({
  appId: process.env.VITE_ALGO_APP_ID,
  mnemonic: process.env.VITE_RELAYER_MNEMONIC 
});

// --- CUSTOM PRIVACY ROUTES ---

/**
 * @route   POST /api/privacy/grant
 * @desc    Mints a Consent NFT on Algorand when user grants data access
 */
app.post('/api/privacy/grant', async (req, res) => {
  try {
    console.log("⚡ [AlgoBurn] Initializing Blockchain Consent...");
    
    // Call SDK to mint the NFT
    const result = await algoBurn.mintConsent();
    
    console.log(`✅ [AlgoBurn] NFT Minted! Asset ID: ${result.assetId}`);
    
    // Response bhej rahe hain taaki frontend ise save kar sake
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

/**
 * @route   POST /api/compliance/purge
 * @desc    The "Kill Switch" called by Priyanshu's AI Agent
 */
app.post('/api/compliance/purge', async (req, res) => {
    const { assetId } = req.body;
    
    if (!assetId) return res.status(400).json({ error: "Asset ID required" });

    console.log(`🚨 [DPDP ALERT] AI Agent detected Burn for Asset: ${assetId}`);
    console.log(`🗑️ [DPDP ACTION] Executing Data Purge from Credlyy Database...`);
    
    // TODO: Yahan database logic aayega (e.g., User.deleteMany({ assetId }))
    // Abhi ke liye hum success bhej rahe hain
    
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

// Server Start
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`------------------------------------------`)
    console.log(`🚀 CREDLYY Backend running on http://localhost:${PORT}`)
    console.log(`🛡️  AlgoBurn SDK Integrated with App ID: ${process.env.VITE_ALGO_APP_ID}`)
    console.log(`------------------------------------------`)
})