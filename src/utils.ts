import type { ApiPromise } from "@polkadot/api"

import { config as envConfig } from "dotenv"

import { Keyring } from "@polkadot/api"
import { blake2AsU8a, encodeAddress } from "@polkadot/util-crypto"
import * as Kilt from "@kiltprotocol/sdk-js"

export function getKeypairSigningCallback(keyring: Keyring): Kilt.SignCallback<Kilt.SigningAlgorithms> {
  return async ({ alg, data, publicKey }) => {
    const keyPreAddress = alg === 'ecdsa-secp256k1' ? blake2AsU8a(publicKey) : publicKey
    const address = encodeAddress(keyPreAddress, Kilt.Utils.ss58Format)
    const signature = keyring.getPair(address).sign(data)
    return {
      alg,
      data: signature,
    }
  }
}

// export function computeChainKeyId(publicKey: Kilt.Did.DidChain.ChainDidPublicKey): Kilt.DidKey['id'] {
//   return Kilt.Utils.Crypto.hashStr(publicKey.toU8a())
// }

// function formatPublicKey(key: Kilt.NewDidKey) {
//   const { type, publicKey } = key
//   return { [type]: publicKey }
// }

// export function encodeToChainKey(api: ApiPromise, key: Kilt.NewDidVerificationKey) {
//   return new (api.registry.getOrThrow<Kilt.Did.DidChain.ChainDidPublicKey>(
//     'DidDidDetailsDidPublicKey'
//   ))(api.registry, {
//     ["PublicVerificationKey"]: formatPublicKey(key),
//   })
// }