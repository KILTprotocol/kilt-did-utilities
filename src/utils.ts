import { config as envConfig } from "dotenv"
import { existsSync } from "fs"
import { writeFile, mkdir } from "fs/promises"

import { ApiPromise } from "@polkadot/api"
import * as Kilt from "@kiltprotocol/sdk-js"


export async function config(): Promise<Kilt.ChainHelpers.Blockchain> {
  envConfig()

  let wsEndpoint = process.env.WS_ENDPOINT
  if (!wsEndpoint) {
    const defaultEndpoint = "wss://spiritnet.kilt.io"
    console.warn(`No env variable WS_ENDPOINT specified. Using the default "${defaultEndpoint}"`)
    wsEndpoint = defaultEndpoint
  }

  await Kilt.init({ address: wsEndpoint })
  return Kilt.connect()
}

export async function writeOutput(value: any) {
  if (!existsSync("out")) {
    await mkdir("out")
  }

  await writeFile("out/result.json", JSON.stringify(value, undefined, 2))
}

export function computeChainKeyId(publicKey: Kilt.Did.DidChain.ChainDidPublicKey): Kilt.DidKey['id'] {
  return Kilt.Utils.Crypto.hashStr(publicKey.toU8a())
}

function formatPublicKey(key: Kilt.NewDidKey) {
  const { type, publicKey } = key
  return { [type]: publicKey }
}

export function encodeToChainKey(api: ApiPromise, key: Kilt.NewDidVerificationKey) {
  return new (api.registry.getOrThrow<Kilt.Did.DidChain.ChainDidPublicKey>(
    'DidDidDetailsDidPublicKey'
  ))(api.registry, {
    ["PublicVerificationKey"]: formatPublicKey(key),
  })
}