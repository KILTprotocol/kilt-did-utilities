# KILT DID utilities

Different scripts that can be used to perform different DID-related operations.

## Install dependencies

Run `yarn install` from the project root.

## Create a new DID

This script requires the following env variables:

- `SUBMITTER_ADDRESS`: The KILT address of the DID creation operation.

The following optional env variables can be passed:

- `WS_ENDPOINT`: The RCP endpoint. Defaults to `wss://spiritnet.kilt.io`.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**. Defaults to a random one.

To run this script, execute `yarn run create-did`, save the DID mnemonic that is printed on the console, and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps](https://polkadot.js.org/apps/#/) using the account specified in `SUBMITTER_ADDRESS`.

## Claim a web3 name

This script requires the following env variables:

- `SUBMITTER_ADDRESS`: The KILT address of the DID creation operation.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.
- `WEB3_NAME`: The web3 name to claim.

The following optional env variables can be passed:

- `WS_ENDPOINT`: The RCP endpoint. Defaults to `wss://spiritnet.kilt.io`.

To run this script, execute `yarn run create-did`, save the DID mnemonic that is printed on the console, and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps](https://polkadot.js.org/apps/#/) using the account specified in `SUBMITTER_ADDRESS`.