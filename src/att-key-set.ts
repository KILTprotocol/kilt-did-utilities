import 'dotenv/config'

import * as Kilt from '@kiltprotocol/sdk-js'

import * as utils from './utils'

async function main() {
  const apiAddress = utils.readWsAddress()
  const api = await Kilt.connect(apiAddress)

  const submitterAddress = process.env[
    utils.envNames.submitterAddress
  ] as Kilt.KiltAddress
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

  const didUri = process.env[utils.envNames.didUri] as Kilt.DidUri
  if (didUri === undefined) {
    throw new Error(`"${utils.envNames.didUri}" not specified.`)
  }

  const newAttKey = utils.generateAttestationKey()
  if (newAttKey === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `The new DID assertion method key mnemonic could not be found. Please specify one of the following variables: "${utils.envNames.attMnemonic}", "${utils.envNames.attDerivationPath}" depending on the use case.`
    )
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

  const newAttKeyTx = api.tx.did.setAttestationKey(
    Kilt.Did.publicKeyToChain(newAttKey)
  )

  const signedExtrinsic = await Kilt.Did.authorizeTx(
    fullDid.uri,
    newAttKeyTx,
    utils.getKeypairTxSigningCallback(authKey),
    submitterAddress
  )

  const encodedOperation = signedExtrinsic.toHex()
  console.log(
    // eslint-disable-next-line max-len
    `New assertion method key operation: ${encodedOperation}. Please submit this via PolkadotJS with the account that was provided: ${submitterAddress}.`
  )
  console.log(
    `Direct link: ${utils.generatePolkadotJSLink(apiAddress, encodedOperation)}`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
