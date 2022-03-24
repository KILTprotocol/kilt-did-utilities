import { readFile } from "fs/promises"

import { Keyring } from "@polkadot/keyring"
import { encodeAddress } from "@polkadot/util-crypto"
import * as Kilt from "@kiltprotocol/sdk-js"

import * as utils from "./utils"

async function main() {
  const { api } = await utils.config()

  const keyring = new Keyring({ ss58Format: 38, type: "sr25519" })
  const keystore = new Kilt.Did.DemoKeystore()

  const fundsMnemonic = process.env.FUNDS_MNEMONIC
  if (!fundsMnemonic) {
    throw `No FUNDS_MNEMONIC env variable specified.`
  }

  const fundsAccount = keyring.addFromMnemonic(fundsMnemonic)
  console.log(`KILT account which will pay for all the deposits: ${fundsAccount.address}`)

  const web3Names: string[] = await readFile("res/web3names.json", { encoding: "utf-8" }).then((c) => JSON.parse(c)).catch((e) => {
    console.error('Please add the web3 names to "res/web3names.json"')
    process.exit(1)
  })
  if (!web3Names.length) {
    console.log('No web3 name found. Exiting.')
    process.exit(0)
  }
  console.log(`Found a total of ${web3Names.length} web3 name${web3Names.length > 1 ? "s" : ""} to claim.`)

  const generatedValues: {web3Name, did, seed}[] = []
  const txs: Kilt.SubmittableExtrinsic[] = []

  console.log("**********")
  for (const [index, name] of web3Names.entries()) {
    console.log(`****Processing name #${index + 1} "${name}"...`)
    const finalSeed = `${fundsMnemonic}//${name}`
    const authKey: Kilt.NewDidVerificationKey = await keystore.generateKeypair({ alg: Kilt.Did.SigningAlgorithms.Sr25519, seed: finalSeed }).then((k) => {
      return {
        publicKey: k.publicKey,
        type: Kilt.VerificationKeyType.Sr25519
      }
    })
    // Creating the full DID even though it is not written on chain, to sign the web3 name claim extrinsic.
    const chainEncodedAuthKey = utils.encodeToChainKey(api, authKey)
    const authKeyId = utils.computeChainKeyId(chainEncodedAuthKey)
    const fullDidIdentifier = encodeAddress(authKey.publicKey, 38)
    const fullDidCreationTx = await new Kilt.Did.FullDidCreationBuilder(api, authKey).consume(keystore, fundsAccount.address)
    // Re-create full DID before the tx is submitted
    const fullDid = new Kilt.Did.FullDidDetails({
        identifier: fullDidIdentifier,
        did: `did:kilt:${fullDidIdentifier}`,
        keyRelationships: { authentication: new Set([authKeyId]) },
        keys: { [authKeyId]: authKey }
    })
    console.log(`****Full DID generated for "${name}". Authentication key seed: ${finalSeed} - DID: ${fullDid.did}.`)
    const claimTx = await Kilt.Did.Web3Names.getClaimTx(name).then((tx) => fullDid.authorizeExtrinsic(tx, keystore, fundsAccount.address))
    generatedValues.push({web3Name: name, did: fullDid.did, seed: finalSeed})
    txs.push(...[fullDidCreationTx, claimTx])
    console.log(`****Process complete for "${name}"`)
  }
  console.log("**********")

  // Batch all txs together, and submit with the submitter account
  const batchedTxs = await api.tx.utility.batchAll(txs)
  await Kilt.BlockchainUtils.signAndSubmitTx(batchedTxs, fundsAccount)

  await utils.writeOutput(generatedValues)
}

main().catch((e) => console.error(e)).then(() => process.exit(0))