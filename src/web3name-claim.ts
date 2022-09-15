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
  web3Name: Kilt.Did.Web3Names.Web3Name
  didUri?: Kilt.DidUri
}

function parseEnv(): EnvConfig {
  config()
  let wsAddress = process.env.WS_ADDRESS
  if (!wsAddress) {
    const defaultWsAddress = 'wss://spiritnet.kilt.io'
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
    const defaultKeyType: KeypairType = 'sr25519'
    console.log(
      `DID_KEY_TYPE not specified. Using '${defaultKeyType}' by default.`
    )
    keyType = defaultKeyType
  }

  const web3Name = process.env.WEB3_NAME as Kilt.Did.Web3Names.Web3Name
  if (!web3Name) {
    throw `No WEB3_NAME env variable specified.`
  }

  const didUri = process.env.DID_URI as Kilt.DidUri | undefined

  return { wsAddress, submitterAddress, didMnemonic, keyType, web3Name, didUri }
}

async function main() {
  const {
    wsAddress,
    submitterAddress,
    didMnemonic,
    keyType,
    web3Name,
    didUri: parsedDidUri,
  } = parseEnv()

  const keyring = new Keyring()
  await Kilt.connect(wsAddress)

  // Re-create DID auth key
  const authKey = keyring.addFromMnemonic(
    didMnemonic,
    {},
    keyType
  ) as Kilt.KiltKeyringPair
  let didUri = parsedDidUri
  if (!didUri) {
    const defaultDidUri: Kilt.DidUri =
      Kilt.Did.Utils.getFullDidUriFromKey(authKey)
    console.log(
      `DID URI not specified. Using '${defaultDidUri}' as derived from the mnemonic by default.`
    )
    didUri = defaultDidUri
  }
  const fullDid: Kilt.DidDocument = {
    uri: didUri,
    authentication: [
      {
        ...authKey,
        // Not needed
        id: '#key',
      },
    ],
  }

  const claimTx = await Kilt.Did.Web3Names.getClaimTx(web3Name)
  const authorizedClaimTx = await Kilt.Did.authorizeExtrinsic(
    fullDid,
    claimTx,
    utils.getKeypairSigningCallback(keyring),
    submitterAddress
  )

  const encodedOperation = authorizedClaimTx.toHex()
  console.log(
    `Encoded web3 name claim operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
