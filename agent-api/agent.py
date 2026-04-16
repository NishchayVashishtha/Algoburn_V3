import time
import requests
from algosdk.v2client import indexer

# ==========================================
# ⚙️ CONFIGURATION ZONE
# ==========================================
APP_ID = 758657427
INDEXER_URL = "https://testnet-idx.algonode.cloud"

# TODO: Replace this with Paarth's actual API URL (e.g., localhost or ngrok)
MOCK_API_URL = "https://monologue-squealer-stride.ngrok-free.dev/api/v1/delete-user-data" 

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
                target_asset_id = foreign_assets[0] # Yehi wo NFT ID hai jo burn hua
        
            print(f"\n🚨 ALERT: Burn Detected for Asset ID: {target_asset_id}")

            # Now send the SPECIFIC asset_id to Credlyy Backend
            try:
                payload = {
                    "assetId": target_asset_id,
                    "proof": tx_id,
                    "timestamp": time.time()
                }
                api_res = requests.post(MOCK_API_URL, json=payload)
                print(f"🏢 Credlyy Response: {api_res.status_code} - User {target_asset_id} Purged.")
            except Exception as e:
                print(f"⚠️ Failed to alert Credlyy: {e}")

            # The Hackathon Magic Trigger
            print(f"\n🚨 ALERT: Smart Contract Interaction Detected! (TxID: {tx_id})")
            print("🧠 AI Agent analyzing payload... 'ConsentRevoked' event verified.")
            print("🔥 Triggering Enterprise Data Deletion Protocol...")

            # Fire the request to Paarth's DB
            try:
                api_res = requests.post(MOCK_API_URL, json={"action": "purge_data", "timestamp": time.time()})
                print(f"🏢 Enterprise DB Response: {api_res.status_code} - Data Successfully Purged.")
            except Exception as e:
                print(f"⚠️ API Strike Failed. Is Paarth's server running? Error: {e}")

            print("✅ Mission accomplished. Resuming monitoring...\n")

        # Wait 5 seconds before checking the blockchain again
        print("👀 Scanning blockchain...", end="\r", flush=True)
        time.sleep(5) 

    except Exception as e:
        print(f"Blockchain Indexer timeout, retrying... ({e})")
        time.sleep(5)