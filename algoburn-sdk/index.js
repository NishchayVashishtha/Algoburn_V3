// AlgoBurn SDK - Refactored for Real On-Chain Transactions
const algosdk = require('algosdk');

class AlgoBurnSDK {
  constructor(config) {
    // Configuration validation
    if (!config.appId) {
      throw new Error('APP_ID is required. Set config.appId.');
    }
    if (!config.mnemonic || config.mnemonic.includes('your_25_word')) {
      throw new Error('RELAYER_MNEMONIC is not configured or is a placeholder. Set a valid 25-word mnemonic in config.mnemonic.');
    }

    this.appId = Number(config.appId);
    
    // Algod client - Testnet via Algonode
    this.algodClient = new algosdk.Algodv2(
      '', 
      'https://testnet-api.algonode.cloud', 
      ''
    );

    // Indexer client for transaction verification
    this.indexerClient = new algosdk.IndexerClient(
      '', 
      'https://testnet-idx.algonode.cloud', 
      ''
    );

    // Relayer account setup
    try {
      this.account = algosdk.mnemonicToSecretKey(config.mnemonic);
    } catch (error) {
      throw new Error('Invalid RELAYER_MNEMONIC. Please provide a valid 25-word mnemonic.');
    }
  }

  /**
   * Diagnostic check - verifies APP_ID and account balance
   */
  async diagnose() {
    const diagnostics = {
      appId: this.appId,
      appExists: false,
      accountAddress: this.account.addr,
      accountBalance: 0,
      errors: []
    };

    // Check app exists
    try {
      const appInfo = await this.algodClient.getApplicationByID(this.appId).do();
      diagnostics.appExists = !appInfo.deleted;
      if (appInfo.deleted) {
        diagnostics.errors.push(`APP_ID ${this.appId} has been deleted on-chain.`);
      }
    } catch (error) {
      if (error.message.includes('invalid')) {
        diagnostics.errors.push(`APP_ID ${this.appId} does not exist on testnet.`);
      } else {
        diagnostics.errors.push(`Failed to verify APP_ID: ${error.message}`);
      }
    }

    // Check account balance
    try {
      const accountInfo = await this.algodClient.accountInformation(this.account.addr).do();
      diagnostics.accountBalance = accountInfo.amount;
      if (accountInfo.amount < 100000) {
        diagnostics.errors.push(`Insufficient balance: ${accountInfo.amount / 1e6} ALGO. Need at least 0.1 ALGO for transactions.`);
      }
    } catch (error) {
      diagnostics.errors.push(`Failed to check account balance: ${error.message}`);
    }

    return diagnostics;
  }

  /**
   * Verifies a transaction was actually confirmed on-chain
   */
  async verifyTransaction(txId) {
    try {
      const info = await this.algodClient.pendingTransactionInformation(txId).do();
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

  /**
   * Mints a Consent SBT (SoulBound Token) on Algorand Testnet.
   * Creates an ASA with clawback enabled - making it SoulBound.
   */
  async mintConsent() {
    try {
      // Diagnostic check first
      const diagnostics = await this.diagnose();
      if (diagnostics.errors.length > 0) {
        throw new Error(`Diagnostic failed: ${diagnostics.errors.join('; ')}`);
      }

      console.log(`⛓️  [SDK] Minting SBT via App ID: ${this.appId}...`);
      
      const params = await this.algodClient.getTransactionParams().do();
      
      // Use ABI method from contract
      const mintMethod = algosdk.ABIMethod.fromSignature('mint_consent()uint64');
      
      const atc = new algosdk.AtomicTransactionComposer();
      const signer = algosdk.makeBasicAccountTransactionSigner(this.account);
      
      // Fee: 3000 microALGO (covers 1 outer + 2 inner transactions)
      params.flatFee = true;
      params.fee = 3000;

      atc.addMethodCall({
        appID: this.appId,
        method: mintMethod,
        methodArgs: [],
        sender: this.account.addr,
        signer: signer,
        suggestedParams: params,
      });

      // Execute and wait for confirmation
      const result = await atc.execute(this.algodClient, 10);
      
      // Verify transaction was confirmed
      const txInfo = await this.verifyTransaction(result.txIDs[0]);
      if (!txInfo.confirmed) {
        throw new Error(`Transaction ${result.txIDs[0]} not confirmed. Status: ${txInfo.status}`);
      }

      const assetId = Number(result.methodResults[0].returnValue);
      
      console.log(`✅ [SDK] SBT minted successfully!`);
      console.log(`   - Transaction ID: ${result.txIDs[0]}`);
      console.log(`   - Asset ID: ${assetId}`);
      console.log(`   - Confirmed at round: ${txInfo.round}`);

      return {
        txId: result.txIDs[0],
        assetId: assetId,
        confirmedRound: txInfo.round,
        explorerUrl: `https://testnet.explorer.perawallet.app/tx/${result.txIDs[0]}`
      };
    } catch (error) {
      console.error('❌ SDK Mint Error:', error.message);
      throw error;
    }
  }

  /**
   * Burns (revokes) a Consent SBT by clawback + destroy.
   */
  async burnConsent(assetId) {
    try {
      // Diagnostic check first
      const diagnostics = await this.diagnose();
      if (diagnostics.errors.length > 0) {
        throw new Error(`Diagnostic failed: ${diagnostics.errors.join('; ')}`);
      }

      console.log(`🔥 [SDK] Burning Consent Asset ID: ${assetId}...`);
      
      const params = await this.algodClient.getTransactionParams().do();
      
      // Use ABI method from contract
      const burnMethod = algosdk.ABIMethod.fromSignature('burn_consent(uint64)void');
      
      const atc = new algosdk.AtomicTransactionComposer();
      const signer = algosdk.makeBasicAccountTransactionSigner(this.account);
      
      // Fee: 3000 microALGO (covers clawback + config transactions)
      params.flatFee = true;
      params.fee = 3000;

      atc.addMethodCall({
        appID: this.appId,
        method: burnMethod,
        methodArgs: [BigInt(assetId)],
        appForeignAssets: [BigInt(assetId)], // Include asset in foreignAssets
        sender: this.account.addr,
        signer: signer,
        suggestedParams: params,
      });

      // Execute and wait for confirmation
      const result = await atc.execute(this.algodClient, 10);
      
      // Verify transaction was confirmed
      const txInfo = await this.verifyTransaction(result.txIDs[0]);
      if (!txInfo.confirmed) {
        throw new Error(`Transaction ${result.txIDs[0]} not confirmed. Status: ${txInfo.status}`);
      }

      console.log(`✅ [SDK] Consent revoked successfully!`);
      console.log(`   - Transaction ID: ${result.txIDs[0]}`);
      console.log(`   - Asset ID: ${assetId}`);
      console.log(`   - Confirmed at round: ${txInfo.round}`);

      return {
        txId: result.txIDs[0],
        assetId: assetId,
        confirmedRound: txInfo.round,
        explorerUrl: `https://testnet.explorer.perawallet.app/tx/${result.txIDs[0]}`
      };
    } catch (error) {
      console.error('❌ SDK Burn Error:', error.message);
      throw error;
    }
  }
}

module.exports = { AlgoBurnSDK };