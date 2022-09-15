import type { KeypairType } from '@polkadot/util-crypto/types'

import * as Kilt from '@kiltprotocol/sdk-js'

import { blake2AsU8a, encodeAddress } from '@polkadot/util-crypto'
import { Keyring } from '@polkadot/api'

export function getKeypairSigningCallback(
  keyring: Keyring
): Kilt.SignCallback<Kilt.SigningAlgorithms> {
  return async ({ alg, data, publicKey }) => {
    const keyPreAddress =
      alg === 'ecdsa-secp256k1' ? blake2AsU8a(publicKey) : publicKey
    const address = encodeAddress(keyPreAddress, Kilt.Utils.ss58Format)
    const signature = keyring.getPair(address).sign(data)
    return {
      alg,
      data: signature,
    }
  }
}

export type Defaults = {
  wsAddress: string
  keyType: KeypairType
}

export const defaults: Defaults = {
  wsAddress: 'wss://spiritnet.kilt.io',
  keyType: 'sr25519'
}
