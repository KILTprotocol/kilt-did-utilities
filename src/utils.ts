import type { KeypairType } from '@polkadot/util-crypto/types'

import * as Kilt from '@kiltprotocol/sdk-js'

export const envNames = {
  wsAddress: 'WS_ADDRESS',
  submitterAddress: 'SUBMITTER_ADDRESS',
  didMnemonic: 'DID_MNEMONIC',
  authMnemonic: 'AUTH_MNEMONIC',
  authDerivationPath: 'AUTH_DERIVATION_PATH',
  authKeyType: 'AUTH_KEY_TYPE',
  attMnemonic: 'ATT_MNEMONIC',
  attDerivationPath: 'ATT_DERIVATION_PATH',
  attKeyType: 'ATT_KEY_TYPE',
  delMnemonic: 'DEL_MNEMONIC',
  delDerivationPath: 'DEL_DERIVATION_PATH',
  delKeyType: 'DEL_KEY_TYPE',
}

export type Defaults = {
  wsAddress: string
  authDerivationPath: string
  authKeyType: KeypairType
  attDerivationPath: string
  attKeyType: KeypairType
  delDerivationPath: string
  delKeyType: KeypairType
}

export const defaults: Defaults = {
  wsAddress: 'wss://spiritnet.kilt.io',
  authDerivationPath: '//did//0',
  authKeyType: 'sr25519',
  attDerivationPath: '//did//assertion//0',
  attKeyType: 'sr25519',
  delDerivationPath: '//did//delegation//0',
  delKeyType: 'sr25519',
}

export function getKeypairSigningCallback(
  keyUri: Kilt.DidResourceUri,
  signingKeypair: Kilt.KiltKeyringPair
): Kilt.SignCallback {
  return async ({ data }) => ({
    signature: signingKeypair.sign(data),
    keyType: signingKeypair.type,
    keyUri,
  })
}

export function getKeypairTxSigningCallback(
  signingKeypair: Kilt.KiltKeyringPair
): Kilt.Did.GetStoreTxSignCallback {
  return async ({ data }) => ({
    signature: signingKeypair.sign(data),
    keyType: signingKeypair.type,
  })
}

export function readAuthenticationKeyMnemonic(): string | undefined {
  // Return the mnemonic directly, if specified
  if (process.env[envNames.authMnemonic] !== undefined) {
    return process.env[envNames.authMnemonic] as string
    // Otherwise use the derivation path on the basic mnemonic, if specified
  } else if (
    process.env[envNames.authDerivationPath] !== undefined &&
    process.env[envNames.didMnemonic] !== undefined
  ) {
    const baseMnemonic = process.env[envNames.didMnemonic] as string
    return baseMnemonic.concat(process.env[envNames.authDerivationPath] as string)
  } else {
    return undefined
  }
}

export function readAttestationKeyMnemonic(): string | undefined {
  // Return the mnemonic directly, if specified
  if (process.env[envNames.attMnemonic] !== undefined) {
    return process.env[envNames.attMnemonic] as string
    // Otherwise use the derivation path on the basic mnemonic, if specified
  } else if (
    process.env[envNames.attDerivationPath] !== undefined &&
    process.env[envNames.didMnemonic] !== undefined
  ) {
    const baseMnemonic = process.env[envNames.didMnemonic] as string
    return baseMnemonic.concat(process.env[envNames.attDerivationPath] as string)
  } else {
    return undefined
  }
}

export function readDelegationKeyMnemonic(): string | undefined {
  // Return the mnemonic directly, if specified
  if (process.env[envNames.delMnemonic] !== undefined) {
    return process.env[envNames.delMnemonic] as string
    // Otherwise use the derivation path on the basic mnemonic, if specified
  } else if (
    process.env[envNames.delDerivationPath] !== undefined &&
    process.env[envNames.didMnemonic] !== undefined
  ) {
    const baseMnemonic = process.env[envNames.didMnemonic] as string
    return baseMnemonic.concat(process.env[envNames.delDerivationPath] as string)
  } else {
    return undefined
  }
}
