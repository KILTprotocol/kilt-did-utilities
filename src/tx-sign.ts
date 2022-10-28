import type { KeypairType } from '@polkadot/util-crypto/types'

import * as Kilt from '@kiltprotocol/sdk-js'

import { Keyring } from '@polkadot/api'
import { config } from 'dotenv'

import * as utils from './utils'

type EnvConfig = {
  wsAddress: string
  submitterAddress: Kilt.KiltAddress
  didMnemonic: string
  keyType: KeypairType
  didUri?: Kilt.DidUri
  encodedTx: `0x${string}`
}

function parseEnv(): EnvConfig {
  config()
  let wsAddress = process.env.WS_ADDRESS
  if (!wsAddress) {
    const defaultWsAddress = utils.defaults.wsAddress
    console.log(
      `WS_ADDRESS not specified. Using '${defaultWsAddress}' by default.`
    )
    wsAddress = defaultWsAddress
  }

  const submitterAddress = process.env.SUBMITTER_ADDRESS as Kilt.KiltAddress
  if (!submitterAddress) {
    throw `No SUBMITTER_ADDRESS env variable specified.`
  }

  const didMnemonic = process.env.DID_MNEMONIC
  if (!didMnemonic) {
    throw `No DID_MNEMONIC env variable specified.`
  }

  let keyType = process.env.DID_KEY_TYPE as KeypairType
  if (!keyType) {
    const defaultKeyType = utils.defaults.keyType
    console.log(
      `DID_KEY_TYPE not specified. Using '${defaultKeyType}' by default.`
    )
    keyType = defaultKeyType
  }

  const encodedTx = process.env.ENCODED_TX as `0x{string}`
  if (!encodedTx) {
    throw `No ENCODED_TX env variable specified.`
  }

  const didUri = process.env.DID_URI as Kilt.DidUri | undefined

  return {
    submitterAddress,
    didMnemonic,
    keyType,
    didUri,
    wsAddress,
    encodedTx,
  }
}

async function main() {
  const {
    wsAddress,
    submitterAddress,
    didMnemonic,
    keyType,
    didUri: parsedDidUri,
    encodedTx,
  } = parseEnv()

  const keyring = new Keyring()
  await Kilt.connect(wsAddress)

  const api = await Kilt.connect(wsAddress)
  // Use provided seed for all keys
  const key = keyring.addFromMnemonic(
    didMnemonic,
    {},
    keyType
  ) as Kilt.KiltKeyringPair
  let didUri = parsedDidUri
  if (!didUri) {
    const defaultDidUri: Kilt.DidUri = Kilt.Did.Utils.getFullDidUriFromKey(key)
    console.log(
      `DID URI not specified. Using '${defaultDidUri}' as derived from the mnemonic by default.`
    )
    didUri = defaultDidUri
  }
  const fullDid: Kilt.DidDocument = {
    uri: didUri,
    authentication: [
      {
        ...key,
        // Not needed
        id: '#key1',
      },
    ],
    assertionMethod: [
      {
        ...key,
        // Not needed
        id: '#key2',
      },
    ],
    capabilityDelegation: [
      {
        ...key,
        // Not needed
        id: '#key3',
      },
    ],
  }

  const decodedCall = api.createType('Call', encodedTx)
  const { method, section } = api.registry.findMetaCall(decodedCall.callIndex)
  const extrinsic = api.tx[section][method](...decodedCall.args)
  const signedExtrinsic = await Kilt.Did.authorizeExtrinsic(
    fullDid,
    extrinsic,
    utils.getKeypairSigningCallback(keyring),
    submitterAddress
  )

  const encodedOperation = signedExtrinsic.toHex()
  console.log(
    `Encoded DID-authorized operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
