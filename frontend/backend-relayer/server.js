require('dotenv').config();
const express = require('express');
const cors = require('cors');
const algosdk = require('algosdk');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Configuration ─────────────────────────────────────────────────────────
const APP_ID = parseInt(process.env.APP_ID, 10);
const API_KEY = process.env.API_KEY || 'dev-key-change-in-production';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

// Algorand clients
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
const indexerClient = new algosdk.IndexerClient('', 'https://testnet-idx.algonode.cloud', '');

// Relayer account
let relayerAccount;
try {
  if (!process.env.RELAYER_MNEMONIC) {
    throw new Error('RELAYER_MNEMONIC not set in environment variables');
  }
  relayerAccount = algosdk.mnemonicToSecretKey(process.env.RELAYER_MNEMONIC);
  console.log(`✅ Relayer account loaded: ${relayerAccount.addr}`);
} catch (error) {
  console.error('❌ Failed to load relayer account:', error.message);
  process.exit(1);
}

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || ALLOWED_ORIGINS.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// API Key validation middleware
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Invalid or missing x-api-key header' 
    });
  }
  next();
}

// ─── Helper Functions ──────────────────────────────────────────────────────
async function verifyTransaction(txId) {
  try {
    const info = await algodClient.pendingTransactionInformation(txId).do();
    if (info['confirmed-round']) {
      return {
        confirmed: true,
        round: info['confirmed-round'],
        assetId: info['created-asset-index'] || null
      };
    }
    return { confirmed: false, status: info['pool-error'] || 'pending' };
  } catch (error) {
    return { confirmed: false, error: error.message };
  }
}

async function runDiagnostics() {
  const diagnostics = {
    appId: APP_ID,
    appExists: false,
    accountAddress: relayerAccount.addr,
    accountBalance: 0,
    errors: []
  };

  try {
    const accountInfo = await algodClient.accountInformation(relayerAccount.addr).do();
    diagnostics.accountBalance = accountInfo.amount;
    if (accountInfo.amount < 100000) {
      diagnostics.errors.push(`Insufficient balance: ${accountInfo.amount / 1e6} ALGO. Need at least 0.1 ALGO.`);
    }
  } catch (error) {
    diagnostics.errors.push(`Failed to check account: ${error.message}`);
  }

  try {
    const appInfo = await algodClient.getApplicationByID(APP_ID).do();
    diagnostics.appExists = !appInfo.deleted;
    if (appInfo.deleted) {
      diagnostics.errors.push(`APP_ID ${APP_ID} has been deleted.`);
    }
  } catch (error) {
    diagnostics.errors.push(`APP_ID ${APP_ID} does not exist: ${error.message}`);
  }

  return diagnostics;
}

// ─── Routes ────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AlgoBurn Relayer',
    relayerAddress: relayerAccount.addr,
    appId: APP_ID
  });
});

// Diagnostics endpoint
app.get('/api/diagnostics', requireApiKey, async (req, res) => {
  try {
    const diagnostics = await runDiagnostics();
    res.json({ success: true, diagnostics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mint consent NFT
app.post('/api/mint-consent', requireApiKey, async (req, res) => {
  try {
    console.log('⚡ Minting consent NFT...');
    
    // Run diagnostics first
    const diagnostics = await runDiagnostics();
    if (diagnostics.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Diagnostic failed: ${diagnostics.errors.join('; ')}`
      });
    }

    const params = await algodClient.getTransactionParams().do();
    const mintMethod = algosdk.ABIMethod.fromSignature('mint_consent()uint64');
    
    const atc = new algosdk.AtomicTransactionComposer();
    const signer = algosdk.makeBasicAccountTransactionSigner(relayerAccount);
    
    params.flatFee = true;
    params.fee = 3000;

    atc.addMethodCall({
      appID: APP_ID,
      method: mintMethod,
      methodArgs: [],
      sender: relayerAccount.addr,
      signer: signer,
      suggestedParams: params,
    });

    const result = await atc.execute(algodClient, 10);
    const txInfo = await verifyTransaction(result.txIDs[0]);
    
    if (!txInfo.confirmed) {
      throw new Error(`Transaction not confirmed: ${txInfo.status || txInfo.error}`);
    }

    const assetId = Number(result.methodResults[0].returnValue);
    
    console.log(`✅ SBT minted! Asset ID: ${assetId}, TX: ${result.txIDs[0]}`);

    res.json({
      success: true,
      txId: result.txIDs[0],
      assetId: assetId,
      confirmedRound: txInfo.round,
      explorerUrl: `https://testnet.explorer.perawallet.app/tx/${result.txIDs[0]}`
    });
  } catch (error) {
    console.error('❌ Mint error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Claim consent NFT
app.post('/api/claim-consent', requireApiKey, async (req, res) => {
  try {
    const { assetId } = req.body;
    
    if (!assetId) {
      return res.status(400).json({ success: false, error: 'assetId is required' });
    }

    console.log(`⚡ Claiming consent NFT ${assetId}...`);

    // Opt-in first
    const optInParams = await algodClient.getTransactionParams().do();
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: relayerAccount.addr,
      receiver: relayerAccount.addr,
      assetIndex: assetId,
      amount: 0,
      suggestedParams: { ...optInParams, flatFee: true, fee: 1000 },
    });
    
    const signedOptIn = optInTxn.signTxn(relayerAccount.sk);
    const { txid: optInTxId } = await algodClient.sendRawTransaction(signedOptIn).do();
    await algosdk.waitForConfirmation(algodClient, optInTxId, 10);

    // Claim via contract
    const params = await algodClient.getTransactionParams().do();
    const claimMethod = algosdk.ABIMethod.fromSignature('claim_consent(uint64)void');
    
    const atc = new algosdk.AtomicTransactionComposer();
    const signer = algosdk.makeBasicAccountTransactionSigner(relayerAccount);
    
    params.flatFee = true;
    params.fee = 2000;

    atc.addMethodCall({
      appID: APP_ID,
      method: claimMethod,
      methodArgs: [BigInt(assetId)],
      appForeignAssets: [BigInt(assetId)],
      sender: relayerAccount.addr,
      signer: signer,
      suggestedParams: params,
    });

    const result = await atc.execute(algodClient, 10);
    const txInfo = await verifyTransaction(result.txIDs[0]);

    console.log(`✅ Consent claimed! TX: ${result.txIDs[0]}`);

    res.json({
      success: true,
      txId: result.txIDs[0],
      confirmedRound: txInfo.round,
      explorerUrl: `https://testnet.explorer.perawallet.app/tx/${result.txIDs[0]}`
    });
  } catch (error) {
    console.error('❌ Claim error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Burn consent NFT
app.post('/api/burn-consent', requireApiKey, async (req, res) => {
  try {
    const { assetId } = req.body;
    
    if (!assetId) {
      return res.status(400).json({ success: false, error: 'assetId is required' });
    }

    console.log(`🔥 Burning consent NFT ${assetId}...`);

    const diagnostics = await runDiagnostics();
    if (diagnostics.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Diagnostic failed: ${diagnostics.errors.join('; ')}`
      });
    }

    const params = await algodClient.getTransactionParams().do();
    const burnMethod = algosdk.ABIMethod.fromSignature('burn_consent(uint64)void');
    
    const atc = new algosdk.AtomicTransactionComposer();
    const signer = algosdk.makeBasicAccountTransactionSigner(relayerAccount);
    
    params.flatFee = true;
    params.fee = 3000;

    atc.addMethodCall({
      appID: APP_ID,
      method: burnMethod,
      methodArgs: [BigInt(assetId)],
      appForeignAssets: [BigInt(assetId)],
      sender: relayerAccount.addr,
      signer: signer,
      suggestedParams: params,
    });

    const result = await atc.execute(algodClient, 10);
    const txInfo = await verifyTransaction(result.txIDs[0]);
    
    if (!txInfo.confirmed) {
      throw new Error(`Transaction not confirmed: ${txInfo.status || txInfo.error}`);
    }

    console.log(`✅ Consent revoked! TX: ${result.txIDs[0]}`);

    res.json({
      success: true,
      txId: result.txIDs[0],
      assetId: assetId,
      confirmedRound: txInfo.round,
      explorerUrl: `https://testnet.explorer.perawallet.app/tx/${result.txIDs[0]}`
    });
  } catch (error) {
    console.error('❌ Burn error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 AlgoBurn Relayer Backend');
  console.log('='.repeat(60));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔑 Relayer Address: ${relayerAccount.addr}`);
  console.log(`📱 App ID: ${APP_ID}`);
  console.log(`🔐 API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`🌐 Allowed Origins: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log('='.repeat(60) + '\n');
});
