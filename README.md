![](.maintain/media/kilt.png)

# KILT DID utilities

A series of scripts to perform many DID-related operations on any KILT blockchain.

**These scripts do not perform any sort of runtime checks before the transactions are signed, which means that users must check themselves that all the pre-requisites for the given transaction to go through are in place.**

## Install dependencies

Run `yarn install` from the project root.

## Create a new full DID

This script writes a new full DID on the target KILT blockchain.

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.

Additionally, depending on the use case, the following combination of variables can be passed to this script:

1. `DID_MNEMONIC` for the OPTIONAL base DID mnemonic (if none is provided, a default one will be generated), `AUTH_DERIVATION_PATH` for the REQUIRED derivation path of the authentication key from the base mnemonic, `ATT_DERIVATION_PATH` for the OPTIONAL derivation path of the assertion method key (if none is provided, no assertion method key will be added to the DID), `DEL_DERIVATION_PATH` for the OPTIONAL derivation path of the capability delegation key, which follows the same logic as the assertion method key.
2. No `DID_MNEMONIC`, but a REQUIRED `AUTH_MNEMONIC` for the mnemonic of the authentication key, an OPTIONAL `ATT_MNEMONIC` for the mnemonic of the assertion method key, and an OPTIONAL `DEL_MNEMONIC` for the mnemonic of the capability delegation key. As with point 1, if `ATT_MNEMONIC` and/or `DEL_MNEMONIC` are not provided, the resulting DID will not have those keys set.

For each key, an optional key type can be specified, i.e., `AUTH_KEY_TYPE`, `ATT_KEY_TYPE`, and `DEL_KEY_TYPE`. Each of them defaults to the `sr25519` key type.

In practice, use case 1 is useful for those that still don't have a mnemonic or that derive all keys from a single mnemonic, which could either be generated on-the-fly (and stored), or provided with the `DID_MNEMONIC` variable.
Use case 2 is only useful in those cases where each key has its own mnemonic.

To run this script, execute `yarn did-create`, save the DID mnemonic that is printed on the console, and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps][polkadot-apps] in `Developer > Extrinsics > Decode`, using the account specified in `SUBMITTER_ADDRESS`.

## Authorize a call with a DID key

This script signs any valid HEX-encoded call with the right key re-generated from the provided seedling information, i.e., either with the provided mnemonic, or with the provided combination of base mnemonic and derivation path.

Valid HEX-encoded calls can be generated by interacting with [PolkadotJS Apps][polkadot-apps] under the `Developer > Extrinsics` menu.
Once the right call (i.e., the right pallet and right method) with the right parameters has been specified, the HEX-encoded value under `encoded call data` can be copied and passed as parameter to this script.

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.
- `ENCODED_CALL`: The HEX-encoded call to DID-sign.
- `DID_URI`: The URI of the DID authorizing the operation

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.

As with DID creation, there is no strong requirement on what other variables must be set.
Depending on the expected key to be used to sign the call, the right mnemonic or the right base mnemonic + derivation path must be provided.

For instance, if a call requires a DID authentication key, either `AUTH_MNEMONIC` or `DID_MNEMONIC` and `AUTH_DERIVATION_PATH` must be specified.
If a call requires a DID assertion method key, either `ATT_MNEMONIC` or `DID_MNEMONIC` and `ATT_DERIVATION_PATH` must be specified.

To run this script, execute `yarn call-authorize` and then copy the HEX-encoded operation to be submitted via [PolkadotJS Apps][polkadot-apps] in `Developer > Extrinsics > Decode`, using the account specified in `SUBMITTER_ADDRESS`.

## Change a DID key

The following env variables are required:

- `SUBMITTER_ADDRESS`: The KILT address (encoded with the KILT network prefix `38`) that is authorized to submit the transaction.
- `DID_URI`: The URI of the DID authorizing the operation

The following optional env variables can be passed:

- `WS_ADDRESS`: The endpoint address. Defaults to `wss://spiritnet.kilt.io`.

There are scripts to change each of the keys of a DID, that require some additional variables to be specified:

- `yarn auth-key-set` changes the current DID authentication key with the new one derived from either `NEW_AUTH_MNEMONIC` or `DID_MNEMONIC` and `NEW_AUTH_DERIVATION_PATH`
- `yarn att-key-set` changes the current DID assertion method key with a new one derived from either `ATT_MNEMONIC` or `DID_MNEMONIC` and `ATT_DERIVATION_PATH`
- `yarn del-key-set` changes the current DID capability delegation key with a new one derived from either `DEL_MNEMONIC` or `DID_MNEMONIC` and `DEL_DERIVATION_PATH`

Since all operations require a DID signature generated from the current authentication key, `AUTH_MNEMONIC` or `DID_MNEMONIC` and `AUTH_DERIVATION_PATH` must still be specified to re-construct the key required to sign the operation.

[polkadot-apps]: (https://polkadot.js.org/apps/#/)