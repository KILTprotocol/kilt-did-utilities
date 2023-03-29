import * as Kilt from '@kiltprotocol/sdk-js'

import * as utils from './utils'

async function main() {
  const api = await Kilt.connect(utils.readWsAddress())

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
    assertionMethod: assertionKey ? [
      {
        ...assertionKey,
        // Not needed
        id: '#key2'
      }
    ] : undefined,
    capabilityDelegation: delegationKey ? [
      {
        ...delegationKey,
        // Not needed
        id: '#key'
      }
    ] : undefined,
  }

  const encodedCall = process.env[utils.envNames.encodedCall]

  const decodedCall = api.createType('Call', encodedCall)
  const { method, section } = api.registry.findMetaCall(decodedCall.callIndex)
  const extrinsic = api.tx[section][method](...decodedCall.args)
  const requiredKey = (() => {
    const requiredKey = Kilt.Did.getKeyRelationshipForTx(extrinsic)
    switch (requiredKey) {
      case 'authentication': return authKey
      case 'assertionMethod': return assertionKey
      case 'capabilityDelegation': return delegationKey
    }
  })()
  if (requiredKey === undefined) {
    throw new Error('The required DID key to sign the operation is not part of the DID Document. Please add such a key before re-trying.')
  }
  const signedExtrinsic = await Kilt.Did.authorizeTx(
    fullDid.uri,
    extrinsic,
    utils.getKeypairTxSigningCallback(requiredKey),
    submitterAddress
  )

  const encodedOperation = signedExtrinsic.toHex()
  console.log(
    `Encoded DID-authorized operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
