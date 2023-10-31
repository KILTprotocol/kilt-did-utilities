import 'dotenv/config'

import * as Kilt from '@kiltprotocol/sdk-js'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { dipProviderCalls, types } from '@kiltprotocol/type-definitions'
import { cryptoWaitReady } from '@polkadot/util-crypto'

import * as utils from './utils'

async function main() {
  const relayWsAddress = process.env[utils.envNames.relayWsAddress]
  const providerWsAddress = process.env[utils.envNames.providerWsAddress]
  if (relayWsAddress === undefined) {
    throw new Error(
      `No ${utils.envNames.relayWsAddress} env variable specified.`
    )
  }
  if (providerWsAddress === undefined) {
    throw new Error(
      `No ${utils.envNames.providerWsAddress} env variable specified.`
    )
  }
  const submitterAddress = process.env[
    utils.envNames.submitterAddress
  ] as Kilt.KiltAddress
  if (submitterAddress === undefined) {
    throw new Error(
      `No "${utils.envNames.submitterAddress}" env variable specified.`
    )
  }

  await cryptoWaitReady()
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

  const consumerApi = await ApiPromise.create({
    provider: new WsProvider(relayWsAddress),
  })

  const encodedCall = process.env[utils.envNames.encodedCall]
  const decodedCall = consumerApi.createType('Call', encodedCall)

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

  const providerApi = await ApiPromise.create({
    provider: new WsProvider(providerWsAddress),
    runtime: dipProviderCalls,
    types,
  })
  const didKeyId = utils.computeDidKeyId(
    providerApi,
    requiredKey.publicKey,
    requiredKey.type
  )

  const includeWeb3Name =
    process.env[utils.envNames.includeWeb3Name]?.toLowerCase() === 'true' ||
    utils.defaults.includeWeb3Name
  const signedExtrinsic = await utils.generateParentDipTx(
    consumerApi,
    providerApi,
    didUri,
    decodedCall,
    submitterAddress,
    didKeyId,
    verificationMethod,
    includeWeb3Name,
    utils.getKeypairTxSigningCallback(requiredKey)
  )

  const encodedOperation = signedExtrinsic.toHex()
  console.log(
    `
    DIP tx: ${encodedOperation}.
    Please add these details to the "dipConsumer.dispatchAs" function in PolkadotJS.
    `
  )
  console.log(
    `Direct link: ${utils.generatePolkadotJSLink(
      relayWsAddress,
      encodedOperation
    )}`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
