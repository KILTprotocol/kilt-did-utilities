import * as Kilt from '@kiltprotocol/sdk-js'

import * as utils from './utils'

async function main() {
  const api = await Kilt.connect(utils.readWsAddress())

  const submitterAddress = process.env.SUBMITTER_ADDRESS as Kilt.KiltAddress
  if (!submitterAddress) {
    throw new Error(`No ${utils.envNames.submitterAddress} env variable specified.`)
  }

  // Re-create DID auth key
  const authKey = utils.generateAuthenticationKey()
  if (authKey === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `DID authentication key mnemonic could not be found. Please specify one of the following variables: '${utils.envNames.authMnemonic}', '${utils.envNames.authDerivationPath} depending on the use case.'
    `)
  }
  const didUri = utils.generateDidUri()
  if (didUri === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `DID URI could not be parsed. Either specify one with "${utils.envNames.didUri}" or provide the mnemonic for the authentication key, if it has never been changed for the DID.`
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

  const serviceId = process.env[utils.envNames.serviceId] as Kilt.DidServiceEndpoint['id']
  if (!serviceId) {
    throw new Error(`No ${utils.envNames.serviceId} env variable specified.`)
  }

  const removeServiceTx = await api.tx.did.removeServiceEndpoint(serviceId)

  const authorizedRemoveServiceTx = await Kilt.Did.authorizeTx(
    fullDid.uri,
    removeServiceTx,
    utils.getKeypairTxSigningCallback(authKey),
    submitterAddress
  )

  const encodedOperation = authorizedRemoveServiceTx.toHex()
  console.log(
    `Encoded service endpoint removal operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
