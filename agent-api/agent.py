import time
import base64
import requests
from algosdk.v2client import indexer

# ==========================================
# ⚙️  CONFIGURATION
# ==========================================
APP_ID           = 758657427
INDEXER_URL      = "https://testnet-idx.algonode.cloud"

# 🚀 FIX 1: Changed port from 3000 to 4000 to match your Node.js backend
ENTERPRISE_API   = "http://localhost:4000/api/compliance/purge"
USERS_API        = "http://localhost:4000/api/users/all"
ENTERPRISE_KEY = "algoburn-compliance-key"

# ARC4 method selector for burn_consent(uint64)void
BURN_METHOD_NAME = "burn_consent"

myindexer = indexer.IndexerClient(indexer_token="", indexer_address=INDEXER_URL)

# ── Helpers ──────────────────────────────────────────────────────────────────

def get_current_round():
    try:
        return myindexer.health().get("round", 0)
    except Exception as e:
        print(f"Warning: Could not fetch initial round: {e}")
        return 0

def is_burn_transaction(tx: dict) -> bool:
    app_txn = tx.get("application-transaction", {})
    args    = app_txn.get("application-args", [])
    if not args:
        return False

    try:
        selector_bytes = base64.b64decode(args[0])
        import hashlib
        sig    = "burn_consent(uint64)void"
        digest = hashlib.new("sha512_256", sig.encode()).digest()
        expected_selector = digest[:4]
        return selector_bytes == expected_selector
    except Exception:
        return False

def extract_sender(tx: dict) -> str:
    return tx.get("sender", "unknown")

def resolve_user_id(sender_address: str) -> str | None:
    RELAYER_TO_USER = {
        "E6BVL6D2BAGZQ6NYZMNPDWIXSN2ZNQ5CI2MCWMGZ3SWUSEW3COGDACOHEER": "user_001",
    }
    return RELAYER_TO_USER.get(sender_address, None)

def purge_user(user_id: str, tx_id: str):
    """Calls the Enterprise API to purge a specific user."""
    try:
        res = requests.post(
            ENTERPRISE_API,
            json={"userId": user_id},
            headers={
                "Content-Type": "application/json",
                "x-api-key": ENTERPRISE_KEY, # API Key included
            },
            timeout=10,
        )
        if res.status_code == 200:
            print(f"  ✅ Enterprise DB purged: {user_id} (TxID: {tx_id})")
        else:
            print(f"  ⚠️  Enterprise API returned {res.status_code}: {res.text}")
    except Exception as e:
        print(f"  ❌ Enterprise API call failed: {e}")

def purge_all_active_users(tx_id: str):
    """Fallback for demo: fetches all users and purges every Active one."""
    try:
        # 🚀 FIX 2: Added x-api-key header and fixed the port to 4000
        res = requests.get(
            USERS_API, 
            headers={"x-api-key": ENTERPRISE_KEY}, 
            timeout=10
        )
        users = res.json().get("users", [])
        active = [u for u in users if u["status"] == "Active"]
        if not active:
            print("  ℹ️  No active users to purge.")
            return
        for user in active:
            purge_user(user["userId"], tx_id)
    except Exception as e:
        print(f"  ❌ Could not fetch users for bulk purge: {e}")

# ── Main loop ────────────────────────────────────────────────────────────────

print("=" * 55)
print("🤖  ALGOBURN AI AGENT ACTIVATED")
print(f"📡  Monitoring App ID {APP_ID} on Algorand TestNet")
print(f"🏢  Enterprise API  : {ENTERPRISE_API}")
print("=" * 55 + "\n")

last_round = get_current_round()
print(f"Starting from round {last_round}\n")

while True:
    try:
        response = myindexer.search_transactions(
            application_id=APP_ID,
            min_round=last_round + 1,
        )
        transactions = response.get("transactions", [])

        for tx in transactions:
            tx_id           = tx.get("id", "unknown")
            confirmed_round = tx.get("confirmed-round", 0)

            if confirmed_round > last_round:
                last_round = confirmed_round

            if not is_burn_transaction(tx):
                print(f"  ↳ Skipping non-burn tx {tx_id[:12]}...")
                continue

            sender = extract_sender(tx)
            print(f"\n🚨  burn_consent detected!")
            print(f"    TxID   : {tx_id}")
            print(f"    Sender : {sender}")
            print(f"    Round  : {confirmed_round}")
            print("🧠  AI Agent: ConsentRevoked event verified. Triggering purge...")

            user_id = resolve_user_id(sender)
            if user_id:
                purge_user(user_id, tx_id)
            else:
                print("  ℹ️  No address→userId mapping found. Purging all active users (demo mode).")
                purge_all_active_users(tx_id)

            print("✅  Mission complete. Resuming monitoring...\n")

        print("👀  Scanning blockchain...", end="\r", flush=True)
        time.sleep(5)

    except Exception as e:
        print(f"\nIndexer error, retrying in 5s... ({e})")
        time.sleep(5)