import { mnemonicGenerate } from "@polkadot/util-crypto"
import * as Kilt from "@kiltprotocol/sdk-js"

import * as utils from "./utils"

async function main() {
  const { api } = await utils.config()
  const submitterAddress = process.env.SUBMITTER_ADDRESS
  if (!submitterAddress) {
    throw `No SUBMITTER_ADDRESS env variable specified.`
  }

  let didMnemonic = process.env.DID_MNEMONIC
  if (!didMnemonic) {
    console.log('Mnemonic not specified. Generating a random one...')
    didMnemonic = mnemonicGenerate()
  }
  const derivationPath = process.env.DERIVATION_PATH || ""
  didMnemonic = `${didMnemonic}${derivationPath}`
  console.log(`DID mnemonic: ${didMnemonic}. Please save this somewhere safe.`)

  const keystore = new Kilt.Did.DemoKeystore()
  const authKey: Kilt.NewDidVerificationKey = await keystore.generateKeypair({ alg: Kilt.Did.SigningAlgorithms.Sr25519, seed: didMnemonic }).then((k) => {
    return {
      publicKey: k.publicKey,
      type: Kilt.VerificationKeyType.Sr25519
    }
  })
  const fullDidCreationTx = await new Kilt.Did.FullDidCreationBuilder(api, authKey).consume(keystore, submitterAddress)
  const encodedOperation = fullDidCreationTx.toHex()
  console.log(`Encoded DID creation operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`)
}

main().catch((e) => console.error(e)).then(() => process.exit(0))