require('dotenv').config()
const sdk = require('./algoburn-sdk/index.js')

async function test() {
  console.log('=== AlgoBurn SDK Diagnostic ===\n')
  
  const result = await sdk.diagnose()
  console.log('Diagnostic:', {
    enabled: result.enabled,
    appId: result.appId,
    appExists: result.appExists,
    relayerConfigured: result.relayerConfigured,
    relayerBalance: result.relayerBalance?.toString(),
  })
  
  if (!result.appExists) {
    console.log('\n❌ App not deployed on Testnet')
    console.log('   Deploy with: algokit project deploy testnet')
    return
  }
  
  console.log('\n=== Testing mintConsent ===\n')
  try {
    const mintResult = await sdk.mintConsent('test_user_001')
    console.log('\n✅ MINT SUCCESS!')
    console.log('   Asset ID:', mintResult.assetId)
    console.log('   TxID:', mintResult.txId)
    console.log('   Explorer:', mintResult.explorerUrl)
  } catch (err) {
    console.error('\n❌ Mint failed:', err.message)
    if (err.message.includes('fee too small')) {
      console.log('   → Contract needs rebuild without fee=0 in inner transactions')
    }
  }
}

test()