# Web3 name claiming script

Setup the script by declaring the following env variables:

- `FUNDS_MNEMONIC`: The mnemonic of the account that will be used to pay ALL the deposits of the DIDs and web3 names (checked with legal, this is ok). This is required.
- `WS_ENDPOINT`: The RCP endpoint. This is optional and defaults to `wss://spiritnet.kilt.io`.
- `SUBMIT_RESULT`: has a value of `'true'` to indicate the resulting tx be submitted by the script. Otherwise, and by default, only its HEX is printed.

## Setup

Set the web3 names that the script should generate in `res/web3names.json`.

## Run the web3 name claiming

Run `yarn run claim` from the project root. At the end, the `out/result.json` file will contain the result of the operation. It is a new JSON file where each entry has the following structure:

```json
{
    "web3Name": "<claimed_web3_name>",
    "did": "did:kilt:<generated_did>",
    "seed": "<submitter_account_seed>//<claimed_web3_name>",
    "keyType": "<did_key_type>"
  }
```

## Run the web3 name releasing with the generated DID

Specify a new env variable, in addition to the ones above: `DID_SEED`, which should contain the seed to re-create the DID authentication key. After that, run `yarn run release`.