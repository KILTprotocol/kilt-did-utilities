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

  // eslint-disable-next-line max-len
  const authKey =
    utils.generateAuthenticationKey() ??
    Kilt.Utils.Crypto.makeKeypairFromUri('//Alice')
  const assertionKey = utils.generateAttestationKey()
  const delegationKey = utils.generateDelegationKey()

  const didUri = process.env[utils.envNames.didUri] as Kilt.DidUri
  if (didUri === undefined) {
    throw new Error(`"${utils.envNames.didUri}" not specified.`)
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
    assertionMethod: assertionKey
      ? [
        {
          ...assertionKey,
          // Not needed
          id: '#key2',
        },
      ]
      : undefined,
    capabilityDelegation: delegationKey
      ? [
        {
          ...delegationKey,
          // Not needed
          id: '#key3',
        },
      ]
      : undefined,
  }

  const encodedCall = process.env[utils.envNames.encodedCall]
  const decodedCall = api.createType('Call', encodedCall)
  const { method, section } = api.registry.findMetaCall(decodedCall.callIndex)
  const extrinsic = api.tx[section][method](...decodedCall.args)

  const requiredKey = (() => {
    const requiredKey = Kilt.Did.getKeyRelationshipForTx(extrinsic)
    switch (requiredKey) {
      case 'authentication':
        return authKey
      case 'assertionMethod':
        return assertionKey
      case 'capabilityDelegation':
        return delegationKey
    }
  })()
  if (requiredKey === undefined) {
    throw new Error(
      'The DID key to authorize the operation is not part of the DID Document. Please add such a key before re-trying.'
    )
  }
  const signedExtrinsic = await Kilt.Did.authorizeTx(
    fullDid.uri,
    extrinsic,
    utils.getKeypairTxSigningCallback(requiredKey),
    submitterAddress
  )

  const encodedOperation = signedExtrinsic.toHex()
  console.log(
    // eslint-disable-next-line max-len
    `Encoded DID-authorized operation: ${encodedOperation}. Please submit this via PolkadotJS with the account that was provided: ${submitterAddress}.`
  )
  console.log(
    `Direct link: ${utils.generatePolkadotJSLink(apiAddress, encodedOperation)}`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
