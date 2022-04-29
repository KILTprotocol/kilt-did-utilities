import { encodeAddress } from '@polkadot/util-crypto'
import * as Kilt from '@kiltprotocol/sdk-js'

import * as utils from './utils'

const {
  SUBMITTER_ADDRESS,
  DID_MNEMONIC,
  SERVICE_TYPE,
  SERVICE_ID,
  SERVICE_URL,
} = process.env

async function main() {
  const { api } = await utils.config()

  if (!SUBMITTER_ADDRESS) {
    throw `No SUBMITTER_ADDRESS env variable specified.`
  }
  if (!DID_MNEMONIC) {
    throw `No DID_MNEMONIC env variable specified.`
  }
  if (!SERVICE_TYPE) {
    throw `No SERVICE_TYPE env variable specified.`
  }
  if (!SERVICE_ID) {
    throw `No SERVICE_ID env variable specified.`
  }
  if (!SERVICE_URL) {
    throw `No SERVICE_URL env variable specified.`
  }

  const keystore = new Kilt.Did.DemoKeystore()
  const authKey: Kilt.NewDidVerificationKey = await keystore
    .generateKeypair({
      alg: Kilt.Did.SigningAlgorithms.Sr25519,
      seed: DID_MNEMONIC,
    })
    .then((k) => {
      return {
        publicKey: k.publicKey,
        type: Kilt.VerificationKeyType.Sr25519,
      }
    })

  const chainEncodedAuthKey = utils.encodeToChainKey(api, authKey)
  const authKeyId = utils.computeChainKeyId(chainEncodedAuthKey)
  const fullDidIdentifier = encodeAddress(authKey.publicKey, 38)
  // Only interested in re-creating the DID authentication key.
  const fullDid = new Kilt.Did.FullDidDetails({
    identifier: fullDidIdentifier,
    did: `did:kilt:${fullDidIdentifier}`,
    keyRelationships: { authentication: new Set([authKeyId]) },
    keys: { [authKeyId]: authKey },
  })

  const extrinsic = await new Kilt.Did.FullDidUpdateBuilder(api, fullDid)
    .removeServiceEndpoint(SERVICE_ID)
    .consume(keystore, SUBMITTER_ADDRESS)
  const encodedOperation = extrinsic.toHex()
  console.log(
    `Encoded add service endpoint operation: '${encodedOperation}'. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
