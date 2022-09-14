# KILT DID utilities

Different scripts that can be used to perform different DID-related operations.

## Install dependencies

Run `yarn install` from the project root.

## Create a new DID

This script requires the following env variables:

- `SUBMITTER_ADDRESS`: The KILT address of the DID creation operation.

The following optional env variables can be passed:

- `WS_ADDRESS`: The RCP endpoint. Defaults to `wss://spiritnet.kilt.io`.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**. Defaults to a random one.
- `DID_KEY_TYPE`: The key type to generate the DID authenticationn key. Defaults to `sr25519`.

To run this script, execute `yarn did-create`, save the DID mnemonic that is printed on the console, and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps](https://polkadot.js.org/apps/#/) using the account specified in `SUBMITTER_ADDRESS`.

## Claim a web3 name

This script requires the following env variables:

- `SUBMITTER_ADDRESS`: The KILT address of the DID creation operation.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.
- `WEB3_NAME`: The web3 name to claim.

The following optional env variables can be passed:

- `WS_ADDRESS`: The RCP endpoint. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authenticationn key. Defaults to `sr25519`.
- `DID_URI`: The URI of the DID authorizing the operation. It defaults to the one derived from the mnemonic (works only if the DID has not updated its authentication key since creation).

To run this script, execute `yarn web3name-claim` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps](https://polkadot.js.org/apps/#/) using the account specified in `SUBMITTER_ADDRESS`.

## Link an account

This script requires the following env variables:

- `SUBMITTER_ADDRESS`: The KILT address of the DID creation operation.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.

The following optional env variables can be passed:

- `WS_ADDRESS`: The RCP endpoint. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authenticationn key. Defaults to `sr25519`.
- `DID_URI`: The URI of the DID authorizing the operation. It defaults to the one derived from the mnemonic (works only if the DID has not updated its authentication key since creation).

To run this script, execute `yarn account-link` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps](https://polkadot.js.org/apps/#/) using the account specified in `SUBMITTER_ADDRESS`.

## Unlink an account

This script requires the following env variables:

- `SUBMITTER_ADDRESS`: The KILT address of the DID creation operation.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.
- `LINKED_ACCOUNT`: The address of the account to unlink from the provided DID.

The following optional env variables can be passed:

- `WS_ADDRESS`: The RCP endpoint. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authenticationn key. Defaults to `sr25519`.
- `DID_URI`: The URI of the DID authorizing the operation. It defaults to the one derived from the mnemonic (works only if the DID has not updated its authentication key since creation).

To run this script, execute `yarn run unlink-account` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps](https://polkadot.js.org/apps/#/) using the account specified in `SUBMITTER_ADDRESS`.

## DID-sign an encoded extrinsic with the authentication key

This script requires the following env variables:

- `SUBMITTER_ADDRESS`: The KILT address of the DID creation operation.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.
- `ENCODED_TX`: The HEX-encoded extrinsic to DID-sign.

The following optional env variables can be passed:

- `WS_ADDRESS`: The RCP endpoint. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authenticationn key. Defaults to `sr25519`.
- `DID_URI`: The URI of the DID authorizing the operation. It defaults to the one derived from the mnemonic (works only if the DID has not updated its authentication key since creation).

To run this script, execute `yarn tx-sign` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps](https://polkadot.js.org/apps/#/) using the account specified in `SUBMITTER_ADDRESS`.