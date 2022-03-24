import { readFile, writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"

import { config as envConfig } from "dotenv"

import { Keyring } from "@polkadot/keyring"
import { hexToU8a } from "@polkadot/util"
import * as Kilt from "@kiltprotocol/sdk-js"
import { SubmittableExtrinsic } from "@kiltprotocol/sdk-js"
import { ApiPromise } from "@polkadot/api"

let api: ApiPromise

async function config() {
  envConfig()

  let wsEndpoint = process.env.WS_ENDPOINT
  if (!wsEndpoint) {
    const defaultEndpoint = "wss://spiritnet.kilt.io"
    console.warn(`No env variable WS_ENDPOINT specified. Using the default "${defaultEndpoint}"`)
    wsEndpoint = defaultEndpoint
  }

  await Kilt.init({ address: wsEndpoint })
  ;({ api } = await Kilt.connect())
}

async function createDid(keystore: Kilt.Did.DemoKeystore, submitterAccount: string, seed: string, submitPromise: (ext: SubmittableExtrinsic) => Promise<void>): Promise<Kilt.Did.FullDidDetails> {
  const authKey: Kilt.NewDidVerificationKey = await keystore.generateKeypair({ alg: Kilt.Did.SigningAlgorithms.Sr25519, seed }).then((k) => {
    return {
      publicKey: k.publicKey,
      type: Kilt.VerificationKeyType.Sr25519
    }
  })
  return new Kilt.Did.FullDidCreationBuilder(api, authKey).consumeWithHandler(keystore, submitterAccount, submitPromise)
}

async function writeOutput(value: any) {
  if (!existsSync("out")) {
    await mkdir("out")
  }

  await writeFile("out/result.json", JSON.stringify(value, undefined, 2))
}

async function main() {
  await config()

  const keyring = new Keyring({ ss58Format: 38, type: "sr25519" })
  const keystore = new Kilt.Did.DemoKeystore()

  const fundsMnemonic = process.env.FUNDS_MNEMONIC
  if (!fundsMnemonic) {
    throw `No FUNDS_MNEMONIC env variable specified.`
  }

  const fundsAccount = keyring.addFromMnemonic(fundsMnemonic)
  console.log(`KILT account where all the funds will be coming from: ${fundsAccount.address}`)

  const web3Names: string[] = await readFile("res/web3names.json", { encoding: "utf-8" }).then((c) => JSON.parse(c))
  console.log(`Found a total of ${web3Names.length} web3 name${web3Names.length > 1 ? "s" : ""} to claim.`)
  
  const generatedValues: [string, string, string][] = []  // [web3name, did, seed]
  
  console.log("**********")
  for (const [index, name] of web3Names.entries()) {
    console.log(`****Processing name #${index+1} "${name}"...`)
    const finalSeed = `${fundsMnemonic}//${name}`
    const fullDid = await createDid(keystore, fundsAccount.address, finalSeed, async (tx) => {
      await Kilt.BlockchainUtils.signAndSubmitTx(tx, fundsAccount, {
        resolveOn: Kilt.BlockchainUtils.IS_IN_BLOCK
      })
    })
    console.log(`********Full DID created for "${name}". Authentication key seed: ${finalSeed} - DID: ${fullDid.did}.`)
    console.log("********Submitting web3 name claim tx...")
    const claimTx = await Kilt.Did.Web3Names.getClaimTx(name).then((tx) => fullDid.authorizeExtrinsic(tx, keystore, fundsAccount.address))
    await Kilt.BlockchainUtils.signAndSubmitTx(claimTx, fundsAccount, {
      resolveOn: Kilt.BlockchainUtils.IS_IN_BLOCK
    })
    generatedValues.push([name, fullDid.did, finalSeed])
    console.log(`****Process complete for "${name}"`)
  }
  console.log("**********")

  const serializedValues = generatedValues.map(([web3Name, did, seed]) => {
    return {
      web3Name,
      did,
      seed,
    }
  })

  await writeOutput(serializedValues)
}

main().catch((e) => console.error(e)).then(() => process.exit(0))