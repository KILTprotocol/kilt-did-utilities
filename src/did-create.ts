import 'dotenv/config'

import { mnemonicGenerate } from '@polkadot/util-crypto'

import * as Did from '@kiltprotocol/did'
import * as Kilt from '@kiltprotocol/sdk-js'

import type { KiltAddress } from '@kiltprotocol/types'

import * as utils from './utils'

async function main() {
  const apiAddress = utils.readWsAddress()
  await Kilt.connect(apiAddress)

  const submitterAddress = process.env[
    utils.envNames.submitterAddress
  ] as KiltAddress
  if (submitterAddress === undefined) {
    throw new Error(
      `No "${utils.envNames.submitterAddress}" env variable specified.`
    )
  }

  if (
    process.env[utils.envNames.didMnemonic] === undefined &&
    process.env[utils.envNames.authMnemonic] === undefined
  ) {
    console.log(
      `"${utils.envNames.didMnemonic}" not specified. Generating a random one...`
    )
    const mnemonic = mnemonicGenerate()
    process.env[utils.envNames.didMnemonic] = mnemonic
    console.log(`DID mnemonic: ${mnemonic}. Please save this somewhere safe.`)
  }

  const authKey = utils.generateAuthenticationKey()
  if (authKey === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `DID authentication key mnemonic could not be found. Please specify one of the following variables: "${utils.envNames.authMnemonic}", "${utils.envNames.authDerivationPath}" depending on the use case.`
    )
  }
  const authDidKey = Did.multibaseKeyToDidKey(authKey?.publicKeyMultibase)
  const assertionKey = utils.generateAttestationKey()
  const assertionDidKey = assertionKey
    ? Did.multibaseKeyToDidKey(assertionKey.publicKeyMultibase)
    : undefined
  const delegationKey = utils.generateDelegationKey()
  const delegationDidKey = delegationKey
    ? Did.multibaseKeyToDidKey(delegationKey.publicKeyMultibase)
    : undefined

  const fullDidCreationTx = await Did.getStoreTx(
    {
      authentication: [
        {
          publicKey: authDidKey.publicKey,
          type: authDidKey.keyType as Did.DidSigningMethodType,
        },
      ],
      assertionMethod: assertionDidKey
        ? [
            {
              publicKey: assertionDidKey.publicKey,
              type: assertionDidKey.keyType as Did.DidSigningMethodType,
            },
          ]
        : undefined,
      capabilityDelegation: delegationDidKey
        ? [
            {
              publicKey: delegationDidKey.publicKey,
              type: delegationDidKey.keyType as Did.DidSigningMethodType,
            },
          ]
        : undefined,
    },
    submitterAddress,
    utils.getKeypairTxSigningCallback(authKey)
  )

  const encodedOperation = fullDidCreationTx.toHex()
  console.log(
    `Operation will create the following DID: ${Did.getFullDidFromVerificationMethod(
      { publicKeyMultibase: authKey.publicKeyMultibase }
    )} `
  )
  console.log(
    // eslint-disable-next-line max-len
    `Encoded DID creation operation: ${encodedOperation}. Please submit this via PolkadotJS with the account that was provided: ${submitterAddress}.`
  )
  console.log(
    `Direct link: ${utils.generatePolkadotJSLink(
      apiAddress,
      encodedOperation
    )} `
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
