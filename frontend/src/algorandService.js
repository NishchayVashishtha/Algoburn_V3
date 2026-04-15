import algosdk from 'algosdk'

// ── Algod client (TestNet via AlgoNode) ─────────────────────────────────────
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '')

// ── Relayer account (custodial – never shown to the user) ───────────────────
function getRelayerAccount() {
  const mnemonic = import.meta.env.VITE_RELAYER_MNEMONIC
  if (!mnemonic || mnemonic.includes('your_25_word')) {
    throw new Error('VITE_RELAYER_MNEMONIC is not configured in .env')
  }
  return algosdk.mnemonicToSecretKey(mnemonic)
}

async function prepareATC(relayer, fee = 3000) {
  const atc    = new algosdk.AtomicTransactionComposer()
  const signer = algosdk.makeBasicAccountTransactionSigner(relayer)
  const params = await algodClient.getTransactionParams().do()
  params.flatFee = true
  params.fee     = fee          // covers outer + inner txn fees
  return { atc, signer, params }
}

// ── mint_consent() → returns { txId, assetId } ──────────────────────────────
export async function mintConsent() {
  const relayer = getRelayerAccount()
  const appId   = parseInt(import.meta.env.VITE_APP_ID, 10)

  const { atc, signer, params } = await prepareATC(relayer, 3000)

  atc.addMethodCall({
    appID:      appId,
    method:     new algosdk.ABIMethod({ name: 'mint_consent', args: [], returns: { type: 'uint64' } }),
    methodArgs: [],
    sender:     relayer.addr,
    signer,
    suggestedParams: params,
  })

  const result  = await atc.execute(algodClient, 4)
  const assetId = Number(result.methodResults[0].returnValue)
  const txId    = result.txIDs[0]

  return { txId, assetId }
}

// ── claim_consent(asset_id) → void ──────────────────────────────────────────
export async function claimConsent(assetId) {
  const relayer = getRelayerAccount()
  const appId   = parseInt(import.meta.env.VITE_APP_ID, 10)

  // ── Step 1: opt-in (separate tx, must confirm first) ──────────────────────
  const optInParams = await algodClient.getTransactionParams().do()
  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender:      relayer.addr,
    receiver:    relayer.addr,
    assetIndex:  assetId,
    amount:      0,
    suggestedParams: { ...optInParams, flatFee: true, fee: 1000 },
  })
  const signedOptIn = optInTxn.signTxn(relayer.sk)
  const { txid: optInTxId } = await algodClient.sendRawTransaction(signedOptIn).do()
  await algosdk.waitForConfirmation(algodClient, optInTxId, 10)

  // ── Step 2: claim_consent ABI call ─────────────────────────────────────────
  const { atc, signer, params } = await prepareATC(relayer, 2000)

  atc.addMethodCall({
    appID:  appId,
    method: new algosdk.ABIMethod({
      name:    'claim_consent',
      args:    [{ type: 'uint64', name: 'asset_id' }],
      returns: { type: 'void' },
    }),
    methodArgs:    [assetId],
    // 🔥 FIX: 'foreignAssets' ki jagah 'appForeignAssets' use hota hai ATC mein
    appForeignAssets: [assetId], 
    sender:        relayer.addr,
    signer,
    suggestedParams: params,
  })

  await atc.execute(algodClient, 4)
}

// ── burn_consent(asset_id) → returns txId ───────────────────────────────────
export async function burnConsent(assetId) {
  const relayer = getRelayerAccount()
  const appId   = parseInt(import.meta.env.VITE_APP_ID, 10)

  const { atc, signer, params } = await prepareATC(relayer, 3000)

  atc.addMethodCall({
    appID:  appId,
    method: new algosdk.ABIMethod({
      name:    'burn_consent',
      args:    [{ type: 'uint64', name: 'asset_id' }],
      returns: { type: 'void' },
    }),
    methodArgs:    [assetId],
    // 🔥 FIX: 'foreignAssets' ki jagah 'appForeignAssets' use hota hai ATC mein
    appForeignAssets: [assetId],   
    sender:        relayer.addr,
    signer,
    suggestedParams: params,
  })

  const result = await atc.execute(algodClient, 4)
  return result.txIDs[0]
}