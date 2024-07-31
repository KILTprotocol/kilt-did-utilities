import 'dotenv/config'

import * as Kilt from '@kiltprotocol/sdk-js'

import type { Did, KiltAddress } from '@kiltprotocol/types'

import * as utils from './utils'

async function main() {
  const apiAddress = utils.readWsAddress()
  const api = await Kilt.connect(apiAddress)

  const submitterAddress = process.env[
    utils.envNames.submitterAddress
  ] as KiltAddress
  if (submitterAddress === undefined) {
    throw new Error(
      `No "${utils.envNames.submitterAddress}" env variable specified.`
    )
  }

  const authKey = utils.generateAuthenticationKey()
  if (authKey === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `DID authentication key mnemonic could not be found. Please specify one of the following variables: "${utils.envNames.authMnemonic}", "${utils.envNames.authDerivationPath}" depending on the use case.`
    )
  }

  const didUri = process.env[utils.envNames.didUri] as Did
  if (didUri === undefined) {
    throw new Error(`"${utils.envNames.didUri}" not specified.`)
  }

  const newAuthKey = utils.generateNewAuthenticationKey()
  if (newAuthKey === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `The new DID authentication key mnemonic could not be found. Please specify one of the following variables: "${utils.envNames.newAuthMnemonic}", "${utils.envNames.newAuthDerivationPath}" depending on the use case.`
    )
  }

  const { didDocument } = await Kilt.DidResolver.resolve(didUri)

  if (didDocument === undefined) {
    throw new Error(`The specified DID ${didUri} is not a full DID.`)
  }

  const newAuthKeyTx = await Kilt.DidHelpers.setVerificationMethod({
    api,
    didDocument,
    publicKey: newAuthKey,
    relationship: 'authentication',
    signers: await Kilt.getSignersForKeypair({ keypair: authKey }),
    submitter: submitterAddress,
  }).getSubmittable()

  const encodedOperation = newAuthKeyTx.txHex
  console.log(
    // eslint-disable-next-line max-len
    `New authentication key operation: ${encodedOperation}. Please submit this via PolkadotJS with the account that was provided: ${submitterAddress}.`
  )
  console.log(
    `Direct link: ${utils.generatePolkadotJSLink(apiAddress, encodedOperation)}`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
