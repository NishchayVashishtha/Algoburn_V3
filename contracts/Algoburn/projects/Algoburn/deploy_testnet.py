#!/usr/bin/env python3
import json
import base64
import os
from algosdk.v2client.algod import AlgodClient
from algosdk import account, mnemonic
from algosdk.transaction import ApplicationCallTxn, OnComplete, StateSchema

# Read mnemonic from .env.testnet in the contracts folder
env_path = "/mnt/c/Users/Nishchay Vashishtha/Web-3/Hackathons/Algoburn/contracts/.env.testnet"
with open(env_path) as f:
    for line in f:
        if line.startswith("DEPLOYER_MNEMONIC"):
            MNEMONIC = line.split('=')[1].strip().strip('"')
            break

PRIVATE_KEY = mnemonic.to_private_key(MNEMONIC)
ADDRESS = account.address_from_private_key(PRIVATE_KEY)

algod = AlgodClient("a" * 64, "https://testnet-api.4160.nodely.dev")
print(f"Deploying from: {ADDRESS}")

# Get bytecode from arc56
with open("contracts/AlgoBurn.arc56.json") as f:
    app_spec = json.load(f)

approval_bytes = base64.b64decode(app_spec["byteCode"]["approval"])
clear_bytes = base64.b64decode(app_spec["byteCode"]["clear"])

params = algod.suggested_params()

# Use NoOpOC to create the application
txn = ApplicationCallTxn(
    sender=ADDRESS,
    sp=params,
    index=0,  # 0 = create new app
    on_complete=OnComplete.NoOpOC,
    approval_program=approval_bytes,
    clear_program=clear_bytes,
    global_schema=StateSchema(num_uints=0, num_byte_slices=0),
    local_schema=StateSchema(num_uints=0, num_byte_slices=0),
    app_args=[],
)

signed = txn.sign(PRIVATE_KEY)
txid = algod.send_transaction(signed)
print(f"Transaction ID: {txid}")

# Wait for confirmation
import time
while True:
    try:
        status = algod.pending_transaction_info(txid)
        if status.get("confirmed-round"):
            app_id = status["application-index"]
            from algosdk.logic import get_application_address
            print(f"\n=== DEPLOYED ===")
            print(f"App ID: {app_id}")
            print(f"App Address: {get_application_address(app_id)}")
            break
    except:
        pass
    time.sleep(1)