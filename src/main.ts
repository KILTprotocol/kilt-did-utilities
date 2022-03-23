import { readFile } from "fs/promises"

import { config as envConfig } from "dotenv"

import { Keyring } from "@polkadot/keyring"
import { hexToU8a } from "@polkadot/util"
import { waitReady } from "@polkadot/wasm-crypto"
import * as Kilt from "@kiltprotocol/sdk-js"

async function config() {
  envConfig()
  await waitReady()
}

async function main() {
  await config()

  const keyring = new Keyring({ ss58Format: 38, type: 'sr25519' })

  const fundsSeed = process.env.FUNDS_SEED
  if (!fundsSeed) {
    throw `No FUNDS_SEED env variable specified.`
  }

  const fundsAccount = keyring.addFromSeed(hexToU8a(fundsSeed))
  console.log(`KILT account where all the funds will be coming from: ${fundsAccount}`)

  const web3Names: string[] = await readFile('res/web3names.json', { encoding: 'utf-8' }).then((c) => JSON.parse(c))
  console.log(`Found a total of "${web3Names.length}" web3 names to claim.`)
}

main().catch((e) => console.error(e)).then(() => process.exit(0))