import 'dotenv/config'

import * as Did from '@kiltprotocol/did'
import * as Kilt from '@kiltprotocol/sdk-js'

import type { Did as DidIdentifier, KiltAddress } from '@kiltprotocol/types'

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

  // eslint-disable-next-line max-len
  const authKey =
    utils.generateAuthenticationKey() ??
    Kilt.generateKeypair({ seed: '//Alice' })
  const assertionKey = utils.generateAttestationKey()
  const delegationKey = utils.generateDelegationKey()

  const didUri = process.env[utils.envNames.didUri] as DidIdentifier
  if (didUri === undefined) {
    throw new Error(`"${utils.envNames.didUri}" not specified.`)
  }

  const { didDocument } = await Kilt.DidResolver.resolve(didUri)

  if (didDocument === undefined) {
    throw new Error(`The specified DID ${didUri} is not a full DID.`)
  }

  const encodedCall = process.env[utils.envNames.encodedCall]
  const decodedCall = api.createType('Call', encodedCall)
  const { method, section } = api.registry.findMetaCall(decodedCall.callIndex)
  const extrinsic = api.tx[section][method](...decodedCall.args)

  const signers = await (() => {
    const requiredKey = Did.getVerificationRelationshipForTx(extrinsic)
    switch (requiredKey) {
      case 'authentication':
        return Kilt.getSignersForKeypair({ keypair: authKey })
      case 'assertionMethod':
        return assertionKey
          ? Kilt.getSignersForKeypair({ keypair: assertionKey })
          : undefined
      case 'capabilityDelegation':
        return delegationKey
          ? Kilt.getSignersForKeypair({ keypair: delegationKey })
          : undefined
    }
  })()
  if (signers === undefined) {
    throw new Error(
      'The DID key to authorize the operation is not part of the DID Document. Please add such a key before re-trying.'
    )
  }
  const signedExtrinsic = await Kilt.DidHelpers.transact({
    api,
    call: extrinsic,
    didDocument,
    signers,
    submitter: submitterAddress,
  }).getSubmittable()

  const encodedOperation = signedExtrinsic.txHex
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
