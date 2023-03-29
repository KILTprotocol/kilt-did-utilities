import 'dotenv/config'

import { mnemonicGenerate } from '@polkadot/util-crypto'

import * as Kilt from '@kiltprotocol/sdk-js'

import * as utils from './utils'

async function main() {
  await Kilt.connect(utils.readWsAddress())

  const baseMnemonic = process.env[utils.envNames.didMnemonic]
  if (baseMnemonic === undefined) {
    console.log(`${utils.envNames.didMnemonic} not specified. Generating a random one...`)
    const mnemonic = mnemonicGenerate()
    process.env[utils.envNames.didMnemonic] = mnemonic
    console.log(`DID mnemonic: ${mnemonic}. Please save this somewhere safe.`)
  }

  const submitterAddress = process.env[utils.envNames.submitterAddress] as Kilt.KiltAddress
  if (submitterAddress === undefined) {
    throw new Error(`No ${utils.envNames.submitterAddress} env variable specified.`)
  }

  const authKey = utils.generateAuthenticationKey()
  if (authKey === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `DID authentication key mnemonic could not be found. Please specify one of the following variables: '${utils.envNames.authMnemonic}', '${utils.envNames.authDerivationPath} depending on the use case.'
    `)
  }
  const assertionKey = utils.generateAttestationKey()
  const delegationKey = utils.generateDelegationKey()

  const fullDidCreationTx = await Kilt.Did.getStoreTx(
    {
      authentication: [authKey],
      assertionMethod: assertionKey ? [assertionKey] : undefined,
      capabilityDelegation: delegationKey ? [delegationKey] : undefined
    },
    submitterAddress,
    utils.getKeypairTxSigningCallback(authKey)
  )

  const encodedOperation = fullDidCreationTx.toHex()
  console.log(`Operation will create the following DID: ${Kilt.Did.getFullDidUriFromKey(authKey)}`)
  console.log(
    // eslint-disable-next-line max-len
    `Encoded DID creation operation: ${encodedOperation}. Please submit this via PolkadotJS with the account that was provided: ${submitterAddress}.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
