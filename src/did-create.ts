import type { KeypairType } from '@polkadot/util-crypto/types'

import * as Kilt from '@kiltprotocol/sdk-js'

import { Keyring } from '@polkadot/api'
import { mnemonicGenerate } from '@polkadot/util-crypto'

import * as utils from './utils'

type EnvConfig = {
  submitterAddress: Kilt.KiltAddress
  didMnemonic: string
  keyType: KeypairType
}

function parseEnv(): EnvConfig {
  const submitterAddress = process.env.SUBMITTER_ADDRESS as Kilt.KiltAddress
  if (!submitterAddress) {
    throw `No SUBMITTER_ADDRESS env variable specified.`
  }

  let didMnemonic = process.env.DID_MNEMONIC
  if (!didMnemonic) {
    console.log('Mnemonic not specified. Generating a random one...')
    didMnemonic = mnemonicGenerate()
    console.log(
      `DID mnemonic: ${didMnemonic}. Please save this somewhere safe.`
    )
  }

  let keyType = process.env.DID_KEY_TYPE as KeypairType
  if (!keyType) {
    const defaultKeyType: KeypairType = 'sr25519'
    console.log(`Mnemonic not specified. Using '${defaultKeyType}' by default.`)
    keyType = defaultKeyType
  }

  return { submitterAddress, didMnemonic, keyType }
}

async function main() {
  const keyring = new Keyring()

  const { submitterAddress, didMnemonic, keyType } = parseEnv()

  const authKey = keyring.addFromMnemonic(
    didMnemonic,
    {},
    keyType
  ) as Kilt.KiltKeyringPair
  const fullDidCreationTx = await Kilt.Did.Chain.getStoreTx(
    {
      authentication: [authKey],
    },
    submitterAddress,
    utils.getKeypairSigningCallback(keyring)
  )

  const encodedOperation = fullDidCreationTx.toHex()
  console.log(
    `Encoded DID creation operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
