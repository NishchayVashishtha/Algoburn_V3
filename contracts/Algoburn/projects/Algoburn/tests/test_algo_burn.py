import pytest
from algokit_utils import AlgorandClient, AlgoAmount, LogicError
from algokit_utils.application_client import ApplicationClient
from algokit_utils.account import Account
from contracts.algo_burn import AlgoBurn


@pytest.fixture
def algorand() -> AlgorandClient:
    return AlgorandClient.default_localnet()


@pytest.fixture
def deployer(algorand: AlgorandClient) -> Account:
    account = algorand.account.random()
    algorand.account.ensure_funded(
        account.address,
        AlgoAmount(algo=10),
    )
    return account


@pytest.fixture
def app_client(algorand: AlgorandClient, deployer: Account) -> ApplicationClient:
    factory = algorand.client.get_typed_app_factory(AlgoBurn)
    result = factory.deploy(
        on_update="append",
        on_schema_break="append",
        sender=deployer.address,
    )
    return result.app_client


def test_mint_consent(algorand: AlgorandClient, deployer: Account, app_client: ApplicationClient) -> None:
    result = app_client.send.mint_consent()
    asset_id = result.abi_return

    assert asset_id > 0

    account_info = algorand.indexer.accounts(account=deployer.address)
    assets = account_info["accounts"][0].get("assets", [])
    consent_asset = next((a for a in assets if a["asset-id"] == asset_id), None)
    assert consent_asset is not None, "Consent NFT not found in deployer's assets"


def test_burn_consent(algorand: AlgorandClient, deployer: Account, app_client: ApplicationClient) -> None:
    mint_result = app_client.send.mint_consent()
    asset_id = mint_result.abi_return

    app_client.send.burn_consent(asset_id=asset_id)

    account_info = algorand.indexer.accounts(account=deployer.address)
    assets = account_info["accounts"][0].get("assets", [])
    consent_asset = next((a for a in assets if a["asset-id"] == asset_id), None)
    assert consent_asset is None, "Consent NFT should be burned"


def test_burn_invalid_asset(algorand: AlgorandClient, deployer: Account, app_client: ApplicationClient) -> None:
    with pytest.raises(LogicError):
        app_client.send.burn_consent(asset_id=999999999)