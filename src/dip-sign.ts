import 'dotenv/config'

import * as Kilt from '@kiltprotocol/sdk-js'
import { ApiPromise, WsProvider } from '@polkadot/api'

import * as utils from './utils'

async function main() {
  const consumerWsAddress = process.env[utils.envNames.consumerWsAddress]
  if (consumerWsAddress === undefined) {
    throw new Error(
      `No ${utils.envNames.consumerWsAddress} env variable specified.`
    )
  }
  const api = await ApiPromise.create({
    provider: new WsProvider(consumerWsAddress),
  })

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

  const encodedCall = process.env[utils.envNames.encodedCall]
  const decodedCall = api.createType('Call', encodedCall)

  const [requiredKey, verificationMethod] = (() => {
    const providedMethod = utils.parseVerificationMethod()
    switch (providedMethod) {
      case 'authentication':
        return [authKey, providedMethod]
      case 'assertionMethod':
        return [assertionKey, providedMethod]
      case 'capabilityDelegation':
        return [delegationKey, providedMethod]
    }
  })()
  if (requiredKey === undefined) {
    throw new Error(
      'The DID key to authorize the operation is not part of the DID Document. Please add such a key before re-trying.'
    )
  }
  const [dipSignature, blockNumber] = await utils.generateDipTxSignature(
    api,
    didUri,
    decodedCall,
    submitterAddress,
    verificationMethod,
    utils.getKeypairTxSigningCallback(requiredKey)
  )

  console.log(
    `
    DID signature for submission via DIP: ${JSON.stringify(
      utils.hexifyDipSignature(dipSignature),
      null,
      2
    )}.
    Block number used for signature generation: ${blockNumber.toString()}.
    Please add these details to the "dipConsumer.dispatchAs" function in PolkadotJS.
    `
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
