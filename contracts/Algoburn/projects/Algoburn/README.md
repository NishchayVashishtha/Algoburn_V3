# AlgoBurn Smart Contract

DPDP Consent Protocol - A smart contract for minting and burning consent NFTs on Algorand.

## Contract Flow

Due to Algorand's ASA opt-in requirements, the consent NFT flow requires 3 steps:

1. **`mint_consent()`** - Creates the Consent NFT (asset stays in contract)
2. **`claim_consent(asset_id)`** - Caller opts in and claims the NFT to their wallet
3. **`burn_consent(asset_id)`** - Caller transfers NFT back to contract and burns it

## Contract Methods

### `mint_consent() -> uint64`
Mints a non-fungible ASA (Consent NFT). The NFT is held by the contract. Returns the asset ID.

### `claim_consent(asset_id: uint64) -> void`
Transfers the Consent NFT from the contract to the caller's wallet. Caller must opt-in first.

### `burn_consent(asset_id: uint64) -> void`
Accepts the Asset ID of the Consent NFT from the caller, destroys/burns it, and emits a `ConsentRevoked` event.

## Deployment

Deployed to LocalNet: **App ID 1003**
- App Address: `FPKJ7KD37AEIB3MJ6WXEXJIZH4DACLBNCR5PNUQREUWMC2YLIWFH2NHX24`

## Testing

```bash
cd Algoburn/projects/Algoburn
algokit compile python contracts/ --output-arc56
algokit project run test
```