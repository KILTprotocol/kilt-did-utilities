import type { KeypairType } from '@polkadot/util-crypto/types'

import * as Kilt from '@kiltprotocol/sdk-js'

import { Keyring } from '@polkadot/api'
import { KeyringPair } from '@kiltprotocol/sdk-js'
import { config } from 'dotenv'

import * as utils from './utils'

type EnvConfig = {
  wsAddress: string
  submitterAddress: Kilt.KiltAddress
  didMnemonic: string
  keyType: KeypairType
  didUri?: Kilt.DidUri
  linkedAccount: KeyringPair['address']
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

  const linkedAccount = process.env.LINKED_ACCOUNT as KeyringPair['address']
  if (!linkedAccount) {
    throw `No LINKED_ACCOUNT env variable specified.`
  }

  const didUri = process.env.DID_URI as Kilt.DidUri | undefined

  return {
    wsAddress,
    submitterAddress,
    didMnemonic,
    keyType,
    didUri,
    linkedAccount,
  }
}

async function main() {
  const {
    wsAddress,
    submitterAddress,
    didMnemonic,
    keyType,
    didUri: parsedDidUri,
    linkedAccount,
  } = parseEnv()

  const keyring = new Keyring()
  const api = await Kilt.connect(wsAddress)

  // Re-create DID auth key
  const authKey = keyring.addFromMnemonic(
    didMnemonic,
    {},
    keyType
  ) as Kilt.KiltKeyringPair
  let didUri = parsedDidUri
  if (!didUri) {
    const defaultDidUri: Kilt.DidUri = Kilt.Did.getFullDidUriFromKey(authKey)
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

  const unlinkTx = await api.tx.didLookup.removeAccountAssociation(
    Kilt.Did.accountToChain(linkedAccount)
  )
  const authorizedUnlinkTx = await Kilt.Did.authorizeTx(
    fullDid.uri,
    unlinkTx,
    utils.getKeypairTxSigningCallback(authKey),
    submitterAddress
  )

  const encodedOperation = authorizedUnlinkTx.toHex()
  console.log(
    `Encoded account unlinking operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
