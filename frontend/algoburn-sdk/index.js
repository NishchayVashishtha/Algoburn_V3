// SDK Core Logic - CommonJS Version
const algosdk = require('algosdk');
const { AtomicTransactionComposer, ABIMethod } = algosdk;

class AlgoBurnSDK {
  constructor(config) {
    // Config parameters
    this.appId = Number(config.appId);
    this.algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
    
    // Relayer Account Setup (This signs the transactions and pays gas)
    if (config.mnemonic) {
      this.account = algosdk.mnemonicToSecretKey(config.mnemonic);
    }
  }

  /**
   * Mints a Consent NFT on the Algorand Blockchain.
   * Called by the Fintech App (Credlyy$) during onboarding.
   */
  async mintConsent() {
    try {
      const params = await this.algodClient.getTransactionParams().do();
      
      // ABI Method definition for mint_consent
      const mintMethod = new ABIMethod({
        name: "mint_consent",
        args: [],
        returns: { type: "uint64" }
      });

      const atc = new AtomicTransactionComposer();
      const signer = algosdk.makeBasicAccountTransactionSigner(this.account);
      
      // Gas Fee: 3000 (1 Outer + 2 Inner transactions in your Python contract)
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

      console.log(`⛓️  [SDK] Minting NFT via App ID: ${this.appId}...`);
      const result = await atc.execute(this.algodClient, 4);
      
      return {
        txId: result.txIDs[0],
        assetId: Number(result.methodResults[0].returnValue)
      };
    } catch (error) {
      console.error("SDK Mint Error:", error);
      throw error;
    }
  }

  /**
   * Burns a Consent NFT on the Algorand Blockchain.
   * Triggered when the user revokes consent.
   */
  async burnConsent(assetId) {
    try {
      const params = await this.algodClient.getTransactionParams().do();
      
      const burnMethod = new ABIMethod({
        name: "burn_consent",
        args: [{ type: "uint64", name: "asset_id" }],
        returns: { type: "void" }
      });

      const atc = new AtomicTransactionComposer();
      const signer = algosdk.makeBasicAccountTransactionSigner(this.account);

      // Gas Fee: 3000 (Needs to cover Clawback and Destroy inner txns)
      params.flatFee = true;
      params.fee = 3000;

      atc.addMethodCall({
        appID: this.appId,
        method: burnMethod,
        methodArgs: [Number(assetId)],
        appForeignAssets: [Number(assetId)], // Important for Algorand to reference the asset
        sender: this.account.addr,
        signer: signer,
        suggestedParams: params,
      });

      console.log(`🔥 [SDK] Burning Consent Asset ID: ${assetId}...`);
      const result = await atc.execute(this.algodClient, 4);
      
      return result.txIDs[0];
    } catch (error) {
      console.error("SDK Burn Error:", error);
      throw error;
    }
  }
}

// CommonJS Export
module.exports = { AlgoBurnSDK };