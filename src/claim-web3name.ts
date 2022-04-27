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

  const web3Name = process.env.WEB3_NAME
  if (!web3Name) {
    throw `No WEB3_NAME env variable specified.`
  }

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
  
  const claimTx = await Kilt.Did.Web3Names.getClaimTx(web3Name).then((tx) => fullDid.authorizeExtrinsic(tx, keystore, submitterAddress, { txCounter: nonce }))
  const encodedOperation = claimTx.toHex()
  console.log(`Encoded web3 name claim operation: '${encodedOperation}'. Please submit this via PolkadotJS with the account provided here.`)
}

main().catch((e) => console.error(e)).then(() => process.exit(0))