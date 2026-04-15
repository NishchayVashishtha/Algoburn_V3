from algopy import (
    ARC4Contract,
    arc4,
    Global,
    itxn,
    Txn,
)


class ConsentRevoked(arc4.Struct):
    asset_id: arc4.UInt64
    owner: arc4.Address


class AlgoBurn(ARC4Contract):
    @arc4.baremethod(create="require")
    def create_application(self) -> None:
        pass

    @arc4.abimethod
    def mint_consent(self) -> arc4.UInt64:
        sender = Txn.sender

        result = itxn.AssetConfig(
            total=1,
            decimals=0,
            unit_name=b"CONSENT",
            asset_name=b"AlgoBurn Consent NFT",
            url=b"https://algoburn.io/consent-nft",
            manager=Global.current_application_address,
            reserve=Global.current_application_address,
            freeze=Global.current_application_address,
            clawback=Global.current_application_address,
            fee=0,
        ).submit()

        created_asset_id = result.created_asset.id

        itxn.AssetTransfer(
            xfer_asset=created_asset_id,
            asset_receiver=Global.current_application_address,
            asset_amount=0,
            fee=0,
        ).submit()

        return arc4.UInt64(created_asset_id)

    @arc4.abimethod
    def claim_consent(self, asset_id: arc4.UInt64) -> None:
        sender = Txn.sender

        itxn.AssetTransfer(
            xfer_asset=asset_id.native,
            asset_sender=Global.current_application_address,
            asset_receiver=sender,
            asset_amount=1,
            fee=0,
        ).submit()

    @arc4.abimethod
    def burn_consent(self, asset_id: arc4.UInt64) -> None:
        sender = Txn.sender

        itxn.AssetTransfer(
            xfer_asset=asset_id.native,
            asset_sender=sender,
            asset_receiver=Global.current_application_address,
            asset_amount=1,
            fee=0,
        ).submit()

        itxn.AssetConfig(
            config_asset=asset_id.native,
            manager=Global.current_application_address,
            reserve=Global.current_application_address,
            freeze=Global.current_application_address,
            clawback=Global.current_application_address,
            fee=0,
        ).submit()

        arc4.emit(
            ConsentRevoked(asset_id, arc4.Address(sender)),
        )