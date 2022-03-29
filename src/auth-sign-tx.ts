import { encodeAddress } from "@polkadot/util-crypto"
import { BN } from "@polkadot/util"
import * as Kilt from "@kiltprotocol/sdk-js"

import * as utils from "./utils"

async function main() {
  const { api } = await utils.config()
  const submitterAddress = process.env.SUBMITTER_ADDRESS
  if (!submitterAddress) {
    throw `No SUBMITTER_ADDRESS env variable specified.`
  }

  const didMnemonic = process.env.DID_MNEMONIC
  if (!didMnemonic) {
    throw `No DID_MNEMONIC env variable specified.`
  }

  const keystore = new Kilt.Did.DemoKeystore()
  const authKey: Kilt.NewDidVerificationKey = await keystore.generateKeypair({ alg: Kilt.Did.SigningAlgorithms.Sr25519, seed: didMnemonic }).then((k) => {
    return {
      publicKey: k.publicKey,
      type: Kilt.VerificationKeyType.Sr25519
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
    keys: { [authKeyId]: authKey }
  })
  const nonce: BN | undefined = process.env.NONCE ? new BN(process.env.NONCE) : undefined
  
  const encodedTx = process.env.ENCODED_TX
  if (!encodedTx) {
    throw `No ENCODED_TX env variable specified.`
  }

  const decodedCall = api.createType('Call', encodedTx)
  const { method, section } = api.registry.findMetaCall(decodedCall.callIndex)
  const extrinsic = api.tx[section][method](...decodedCall.args)
  const signedExtrinsic = await fullDid.authorizeExtrinsic(extrinsic, keystore, submitterAddress, { txCounter: nonce })
  const encodedOperation = signedExtrinsic.toHex()
  console.log(`Encoded DID creation operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`)
}

main().catch((e) => console.error(e)).then(() => process.exit(0))