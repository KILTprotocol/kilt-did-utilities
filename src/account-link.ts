import type { KeypairType } from '@polkadot/util-crypto/types'

import * as Kilt from '@kiltprotocol/sdk-js'

import { Keyring } from '@polkadot/api'

import * as utils from './utils'

type EnvConfig = {
  submitterAddress: Kilt.KiltAddress
  didMnemonic: string
  keyType: KeypairType
  didUri?: Kilt.DidUri
}

function parseEnv(): EnvConfig {
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
    console.log(`Mnemonic not specified. Using '${defaultKeyType}' by default.`)
    keyType = defaultKeyType
  }

  const didUri = process.env.DID_URI as Kilt.DidUri | undefined

  return { submitterAddress, didMnemonic, keyType, didUri }
}

async function main() {
  const keyring = new Keyring()

  const {
    submitterAddress,
    didMnemonic,
    keyType,
    didUri: parsedDidUri,
  } = parseEnv()

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

  const linkTx = await Kilt.Did.AccountLinks.getAssociateSenderExtrinsic()
  const authorizedLinkTx = await Kilt.Did.authorizeExtrinsic(
    fullDid,
    linkTx,
    utils.getKeypairSigningCallback(keyring),
    submitterAddress
  )

  const encodedOperation = authorizedLinkTx.toHex()
  console.log(
    `Encoded account linking operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
