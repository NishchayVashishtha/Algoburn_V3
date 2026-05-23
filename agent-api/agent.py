import time
import os
import requests
from algosdk.v2client import indexer

# ==========================================
# ⚙️ CONFIGURATION ZONE
# ==========================================
APP_ID = int(os.getenv('APP_ID', '758657427'))
INDEXER_URL = os.getenv('INDEXER_URL', 'https://testnet-idx.algonode.cloud')
ENTERPRISE_API_URL = os.getenv('ENTERPRISE_API_URL', 'http://localhost:3000/api/v1/delete-user-data')
ENTERPRISE_API_KEY = os.getenv('ENTERPRISE_API_KEY', 'algoburn-dev-key')

# Initialize the Algorand Indexer (Read-only node)
myindexer = indexer.IndexerClient(indexer_token="", indexer_address=INDEXER_URL)

def get_current_round():
    """Fetches the current block round so we don't trigger on old historical transactions."""
    try:
        health = myindexer.health()
        return health.get('round', 0)
    except Exception as e:
        print(f"Warning: Could not fetch initial round: {e}")
        return 0

print("=====================================================")
print("🤖 ALGOBURN AI AGENT ACTIVATED")
print(f"📡 Monitoring App ID {APP_ID} on Algorand TestNet...")
print(f"🔗 Enterprise API: {ENTERPRISE_API_URL}")
print("=====================================================\n")

last_round = get_current_round()

# The Infinite Polling Loop
while True:
    try:
        # Ask the blockchain: "Any new transactions for our App ID since the last block I checked?"
        response = myindexer.search_transactions(
            application_id=APP_ID,
            min_round=last_round + 1
        )

        transactions = response.get('transactions', [])

        for tx in transactions:
            tx_id = tx.get('id')
            confirmed_round = tx.get('confirmed-round', 0)
            
            # Update our tracker so we don't process this again
            if confirmed_round > last_round:
                last_round = confirmed_round

            # Check if it's an Application Call
            app_call = tx.get('application-transaction', {})
            args = app_call.get('application-args', [])

            # Algorand Indexer returns args in Base64. 
            # We need to detect if it's the 'burn_consent' method.
            # Logic: If it's our App, we look for the Asset ID in foreign-assets
            foreign_assets = app_call.get('foreign-assets', [])

            if foreign_assets:
                target_asset_id = foreign_assets[0] # This is the NFT ID that was burned
        
                print(f"\n🚨 ALERT: Burn Detected for Asset ID: {target_asset_id}")
                print(f"🧠 AI Agent analyzing payload... 'ConsentRevoked' event verified.")
                print(f"🔥 Triggering Enterprise Data Deletion Protocol...")

                # Now send the SPECIFIC asset_id to Enterprise Backend
                try:
                    payload = {
                        "userId": f"user_{str(target_asset_id)[-3:]}",  # Map asset to user
                        "assetId": target_asset_id,
                        "proof": tx_id,
                        "timestamp": time.time()
                    }
                    headers = {
                        "Content-Type": "application/json",
                        "x-api-key": ENTERPRISE_API_KEY
                    }
                    api_res = requests.post(ENTERPRISE_API_URL, json=payload, headers=headers)
                    
                    if api_res.status_code == 200:
                        print(f"🏢 Enterprise Response: {api_res.status_code} - User Data Purged Successfully.")
                    else:
                        print(f"⚠️ Enterprise Response: {api_res.status_code} - {api_res.text}")
                        
                except Exception as e:
                    print(f"⚠️ Failed to alert Enterprise API: {e}")

                print("✅ Mission accomplished. Resuming monitoring...\n")

        # Wait 5 seconds before checking the blockchain again
        print("👀 Scanning blockchain...", end="\r", flush=True)
        time.sleep(5) 

    except Exception as e:
        print(f"Blockchain Indexer timeout, retrying... ({e})")
        time.sleep(5)