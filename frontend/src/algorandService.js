import algosdk from 'algosdk'

// ── Algod client (TestNet via AlgoNode, no API key needed) ──────────────────
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '')

// ── Relayer account (custodial – never exposed to the end user) ─────────────
function getRelayerAccount() {
  const mnemonic = import.meta.env.VITE_RELAYER_MNEMONIC
  if (!mnemonic || mnemonic.includes('your_25_word')) {
    throw new Error('VITE_RELAYER_MNEMONIC is not configured in .env')
  }
  return algosdk.mnemonicToSecretKey(mnemonic)
}

// ── Wait for a transaction to be confirmed ──────────────────────────────────
async function waitForConfirmation(txId, maxRounds = 10) {
  const status = await algodClient.status().do()
  let lastRound = status['last-round']

  for (let i = 0; i < maxRounds; i++) {
    const pendingInfo = await algodClient
      .pendingTransactionInformation(txId)
      .do()

    if (pendingInfo['confirmed-round'] && pendingInfo['confirmed-round'] > 0) {
      return pendingInfo
    }

    lastRound++
    await algodClient.statusAfterBlock(lastRound).do()
  }

  throw new Error(`Transaction ${txId} not confirmed after ${maxRounds} rounds`)
}

// ── ABI-style app call (used by mint_consent — returns asset ID) ─────────────
export async function mintConsent() {
  const relayer = getRelayerAccount()
  const appId = parseInt(import.meta.env.VITE_APP_ID, 10)

  const mintMethod = new algosdk.ABIMethod({
    name: 'mint_consent',
    args: [],
    returns: { type: 'uint64' },
  })

  const atc = new algosdk.AtomicTransactionComposer()
  const signer = algosdk.makeBasicAccountTransactionSigner(relayer)
  const params = await algodClient.getTransactionParams().do()

  // Cover outer + inner transaction fees
  params.flatFee = true
  params.fee = 3000

  atc.addMethodCall({
    appID: appId,
    method: mintMethod,
    methodArgs: [],
    sender: relayer.addr,
    signer,
    suggestedParams: params,
  })

  const result = await atc.execute(algodClient, 4)
  return result.txIDs[0]
}

// ── NoOp app call (used by burn_consent) ────────────────────────────────────
export async function burnConsent() {
  const relayer = getRelayerAccount()
  const appId = parseInt(import.meta.env.VITE_APP_ID, 10)

  const params = await algodClient.getTransactionParams().do()

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    sender: relayer.addr,
    appIndex: appId,
    appArgs: [new TextEncoder().encode('burn_consent')],
    suggestedParams: params,
  })

  const signedTxn = txn.signTxn(relayer.sk)
  const { txid } = await algodClient.sendRawTransaction(signedTxn).do()
  await waitForConfirmation(txid)
  return txid
}

// ── Enterprise API: purge user data after burn ───────────────────────────────
// userId is the enterprise DB identifier (e.g. "user_001").
// In a real system this would come from your auth layer; here we accept it
// as a parameter so the caller can pass whatever mapping they have.
export async function purgeEnterpriseData(userId) {
  const baseUrl = import.meta.env.VITE_ENTERPRISE_API_URL
  const apiKey  = import.meta.env.VITE_ENTERPRISE_API_KEY

  if (!baseUrl) {
    throw new Error('VITE_ENTERPRISE_API_URL is not set in .env')
  }

  const res = await fetch(`${baseUrl}/api/v1/delete-user-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
    },
    body: JSON.stringify({ userId }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || `Enterprise API error: ${res.status}`)
  }

  return data
}
