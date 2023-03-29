import 'dotenv/config'

import * as Kilt from '@kiltprotocol/sdk-js'

import * as utils from './utils'

async function main() {
  const api = await Kilt.connect(utils.readWsAddress())

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

  const didUri = utils.generateDidUri()
  if (didUri === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `DID URI could not be parsed. Either specify one with "${utils.envNames.didUri}" or provide the mnemonic for the authentication key, if it has never been changed for the DID.`
    )
  }

  const newDelKey = utils.generateDelegationKey()
  if (newDelKey === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `The new DID capability delegation key mnemonic could not be found. Please specify one of the following variables: "${utils.envNames.delMnemonic}", "${utils.envNames.delDerivationPath}" depending on the use case.`
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
    ]
  }

  const newDelKeyTx = api.tx.did.setAttestationKey(Kilt.Did.publicKeyToChain(newDelKey))

  const signedExtrinsic = await Kilt.Did.authorizeTx(
    fullDid.uri,
    newDelKeyTx,
    utils.getKeypairTxSigningCallback(authKey),
    submitterAddress
  )

  const encodedOperation = signedExtrinsic.toHex()
  console.log(
    // eslint-disable-next-line max-len
    `New capability delegation key operation: ${encodedOperation}. Please submit this via PolkadotJS with the account that was provided: ${submitterAddress}.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
