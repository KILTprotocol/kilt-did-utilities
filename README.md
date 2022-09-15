![](.maintain/media/kilt.png)

# KILT DID utilities

A series of scripts to perform many DID-related operations on any KILT blockchain.

**These scripts do not perform any sort of runtime checks before the transactions are signed, which means that users must check themselves that all the pre-requisites for the given transaction to go through are in place.**

## Install dependencies

Run `yarn install` from the project root.

## Create a new full DID

This script writes a new full DID on the target KILT blockchain with only an authentication key.

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**. Defaults to a random one. For DIDs generated via [Sporran][sporran-github], please read the FAQ section.
- `DID_KEY_TYPE`: The key type to generate the DID authentication key. Defaults to `sr25519`.

To run this script, execute `yarn did-create`, save the DID mnemonic that is printed on the console, and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps][polkadot-apps] in `Developer > Extrinsics > Decode`, using the account specified in `SUBMITTER_ADDRESS`.

## Add a service endpoint

This script adds the specified service endpoint to the specified full DID.

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.
- `SERVICE_ID`: The ID of the new service endpoint, **including the leading `#` symbol**.
- `SERVICE_TYPE`: The only type of the new service endpoint.
- `SERVICE_URL`: The only URL of the new service endpoint.

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authentication key. Defaults to `sr25519`.

To run this script, execute `yarn endpoint-add` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps][polkadot-apps] in `Developer > Extrinsics > Decode`, using the account specified in `SUBMITTER_ADDRESS`.

## Remove a service endpoint

This script removes the specified service endpoint (by specifying its ID) from the specified full DID.

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.
- `SERVICE_ID`: The ID of the service endpoint to remove, **including the leading `#` symbol**.

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authentication key. Defaults to `sr25519`.

To run this script, execute `yarn endpoint-remove` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps][polkadot-apps] in `Developer > Extrinsics > Decode`, using the account specified in `SUBMITTER_ADDRESS`.

## Claim a web3name

This script claims the provided web3name for the specified full DID.

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.
- `WEB3_NAME`: The web3name to claim.

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authentication key. Defaults to `sr25519`.
- `DID_URI`: The URI of the DID authorizing the operation. It defaults to the one derived from the mnemonic (works only if the DID has not updated its authentication key since creation).

To run this script, execute `yarn web3name-claim` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps][polkadot-apps] in `Developer > Extrinsics > Decode`, using the account specified in `SUBMITTER_ADDRESS`.

## Link an account

This script links the specified account to the specified full DID.

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authentication key. Defaults to `sr25519`.
- `DID_URI`: The URI of the DID authorizing the operation. It defaults to the one derived from the mnemonic (works only if the DID has not updated its authentication key since creation).

To run this script, execute `yarn account-link` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps][polkadot-apps] in `Developer > Extrinsics > Decode`, using the account specified in `SUBMITTER_ADDRESS`.

## Unlink an account

This script unlinks the specified account from the specified full DID.

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.
- `LINKED_ACCOUNT`: The address of the account to unlink from the provided DID.

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authentication key. Defaults to `sr25519`.
- `DID_URI`: The URI of the DID authorizing the operation. It defaults to the one derived from the mnemonic (works only if the DID has not updated its authentication key since creation).

To run this script, execute `yarn run unlink-account` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps][polkadot-apps] in `Developer > Extrinsics > Decode`, using the account specified in `SUBMITTER_ADDRESS`.

## Authorize an extrinsic with a DID's authentication key

This script signs any valid HEX-encoded extrinsic with the *authentication* key of the provided full DID.

Valid HEX-encoded extrinsics can be generated by interacting with [PolkadotJS Apps][polkadot-apps] under the `Developer > Extrinsics` menu.
Once the right extrinsic (i.e., the right pallet and right method) with the right parameters has been specified, the HEX-encoded value under `encoded call data` can be copied and passed as parameter to this script.

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.
- `DID_MNEMONIC`: The mnemonic of the DID to create, **including any derivation path**.
- `ENCODED_TX`: The HEX-encoded extrinsic to DID-sign.

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.
- `DID_KEY_TYPE`: The key type to generate the DID authentication key. Defaults to `sr25519`.
- `DID_URI`: The URI of the DID authorizing the operation. It defaults to the one derived from the mnemonic (works only if the DID has not updated its authentication key since creation).

To run this script, execute `yarn tx-sign` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps][polkadot-apps] in `Developer > Extrinsics > Decode`, using the account specified in `SUBMITTER_ADDRESS`.

[sporran-github]: https://github.com/BTE-Trusted-Entity/sporran-extension
[polkadot-apps]: (https://polkadot.js.org/apps/#/)