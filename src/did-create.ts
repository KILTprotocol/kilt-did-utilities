import type { KeypairType } from '@polkadot/util-crypto/types'

import { Keyring } from '@polkadot/api'
import { config } from 'dotenv'
import { mnemonicGenerate } from '@polkadot/util-crypto'

import * as Kilt from '@kiltprotocol/sdk-js'

import * as utils from './utils'

type EnvConfig = {
  wsAddress: string
  submitterAddress: Kilt.KiltAddress
  authMnemonic: string
  authKeyType: KeypairType
  attMnemonic?: string
  attKeyType?: KeypairType
  delMnemonic?: string
  delKeyType?: KeypairType
}

function parseEnv(): EnvConfig {
  config()
  let wsAddress = process.env[utils.envNames.wsAddress]
  if (wsAddress === undefined) {
    console.log(
      `${utils.envNames.wsAddress} not specified. Using '${utils.defaults.wsAddress}' by default.`
    )
    wsAddress = utils.defaults.wsAddress
  }

  const submitterAddress = process.env[utils.envNames.submitterAddress] as Kilt.KiltAddress
  if (submitterAddress === undefined) {
    throw new Error(`No ${utils.envNames.submitterAddress} env variable specified.`)
  }

  const baseMnemonic = process.env[utils.envNames.didMnemonic]
  if (baseMnemonic === undefined) {
    console.log(`${utils.envNames.didMnemonic} not specified. Generating a random one...`)
    const mnemonic = mnemonicGenerate()
    process.env[utils.envNames.didMnemonic] = mnemonic
    console.log(`DID mnemonic: ${mnemonic}. Please save this somewhere safe.`)
  }

  const authMnemonic = utils.readAuthenticationKeyMnemonic()
  const authKeyType = (process.env[utils.envNames.authKeyType] || utils.defaults.authKeyType) as KeypairType
  if (authMnemonic === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `DID authentication key mnemonic could not be found. Please specify one of the following variables: '${utils.envNames.authMnemonic}', '${utils.envNames.authDerivationPath}'
    `)
  } else {
    console.log(
      // eslint-disable-next-line max-len
      `DID authentication key mnemonic: "${authMnemonic}" with key type ${authKeyType}.`
    )
  }

  const attMnemonic = utils.readAttestationKeyMnemonic()
  const attKeyType =
    attMnemonic === undefined
      ? undefined
      : ((process.env[utils.envNames.attKeyType] || utils.defaults.attKeyType) as KeypairType)
  if (attMnemonic !== undefined) {
    console.log(
      // eslint-disable-next-line max-len
      `DID assertion method key mnemonic: "${attMnemonic}" with key type ${attKeyType}.`
    )
  }

  const delMnemonic = utils.readDelegationKeyMnemonic()
  const delKeyType =
    delMnemonic === undefined
      ? undefined
      : ((process.env[utils.envNames.delKeyType] || utils.defaults.delKeyType) as KeypairType)
  if (delMnemonic !== undefined) {
    console.log(
      // eslint-disable-next-line max-len
      `DID capability delegation key mnemonic: "${delMnemonic}" with key type ${delKeyType}.`
    )
  }

  return {
    wsAddress,
    submitterAddress,
    authMnemonic,
    authKeyType,
    attMnemonic,
    attKeyType,
    delMnemonic,
    delKeyType,
  }
}

async function main() {
  const {
    wsAddress,
    submitterAddress,
    authMnemonic,
    authKeyType,
    attMnemonic,
    attKeyType,
    delMnemonic,
    delKeyType,
  } = parseEnv()

  const keyring = new Keyring()
  await Kilt.connect(wsAddress)

  const authKey = keyring.addFromMnemonic(
    authMnemonic,
    {},
    authKeyType
  ) as Kilt.KiltKeyringPair

  const fullDidCreationTx = await Kilt.Did.getStoreTx(
    {
      authentication: [authKey],
      assertionMethod: attMnemonic
        ? [
          keyring.addFromMnemonic(
            attMnemonic,
            {},
            attKeyType
          ) as Kilt.KiltKeyringPair,
        ]
        : undefined,
      capabilityDelegation: delMnemonic
        ? [
          keyring.addFromMnemonic(
            delMnemonic,
            {},
            delKeyType
          ) as Kilt.KiltKeyringPair,
        ]
        : undefined,
    },
    submitterAddress,
    utils.getKeypairTxSigningCallback(authKey)
  )

  const encodedOperation = fullDidCreationTx.toHex()
  console.log(
    `Encoded DID creation operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
