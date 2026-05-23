// AlgoBurn Service - Secure Backend Relayer Integration
// No private keys exposed to frontend!

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-key-change-in-production';

async function callBackend(endpoint, data = {}) {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Backend request failed');
  }

  return result;
}

export async function runDiagnostics() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/diagnostics`, {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Diagnostics failed');
    }

    return result.diagnostics;
  } catch (error) {
    console.error('Diagnostics error:', error);
    return {
      appId: 0,
      appExists: false,
      accountAddress: '',
      accountBalance: 0,
      errors: [error.message]
    };
  }
}

export async function mintConsent() {
  console.log('⚡ Requesting mint from backend relayer...');
  const result = await callBackend('/api/mint-consent');
  console.log(`✅ SBT minted! Asset ID: ${result.assetId}, TX: ${result.txId}`);
  return result;
}

export async function claimConsent(assetId) {
  console.log(`⚡ Requesting claim for asset ${assetId} from backend relayer...`);
  const result = await callBackend('/api/claim-consent', { assetId });
  console.log(`✅ Consent claimed! TX: ${result.txId}`);
  return result;
}

export async function burnConsent(assetId) {
  console.log(`🔥 Requesting burn for asset ${assetId} from backend relayer...`);
  const result = await callBackend('/api/burn-consent', { assetId });
  console.log(`✅ Consent revoked! TX: ${result.txId}`);
  return result;
}