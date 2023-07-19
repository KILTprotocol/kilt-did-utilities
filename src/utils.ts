import { Keyring } from '@polkadot/api'

import * as Kilt from '@kiltprotocol/sdk-js'

export const envNames = {
  wsAddress: 'WS_ADDRESS',
  submitterAddress: 'SUBMITTER_ADDRESS',
  didUri: 'DID_URI',
  didMnemonic: 'DID_MNEMONIC',
  authMnemonic: 'AUTH_MNEMONIC',
  authDerivationPath: 'AUTH_DERIVATION_PATH',
  authKeyType: 'AUTH_KEY_TYPE',
  newAuthMnemonic: 'NEW_AUTH_MNEMONIC',
  newAuthDerivationPath: 'NEW_AUTH_DERIVATION_PATH',
  newAuthKeyType: 'NEW_AUTH_KEY_TYPE',
  attMnemonic: 'ATT_MNEMONIC',
  attDerivationPath: 'ATT_DERIVATION_PATH',
  attKeyType: 'ATT_KEY_TYPE',
  delMnemonic: 'DEL_MNEMONIC',
  delDerivationPath: 'DEL_DERIVATION_PATH',
  delKeyType: 'DEL_KEY_TYPE',
  encodedCall: 'ENCODED_CALL',
}

type Defaults = {
  wsAddress: string
  authKeyType: Kilt.KeyringPair['type']
  attKeyType: Kilt.KeyringPair['type']
  delKeyType: Kilt.KeyringPair['type']
}

export const defaults: Defaults = {
  wsAddress: 'wss://spiritnet.kilt.io',
  authKeyType: 'sr25519',
  attKeyType: 'sr25519',
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

export function readWsAddress(): string {
  let wsAddress = process.env[envNames.wsAddress]
  if (wsAddress === undefined) {
    console.log(
      `${envNames.wsAddress} not specified. Using '${defaults.wsAddress}' by default.`
    )
    wsAddress = defaults.wsAddress
  }
  return wsAddress
}

function readAuthenticationKeyMnemonic(): string | undefined {
  // Return the mnemonic directly, if specified
  if (process.env[envNames.authMnemonic] !== undefined) {
    return process.env[envNames.authMnemonic]
    // Otherwise use the derivation path on the basic mnemonic, if specified
  } else if (
    process.env[envNames.didMnemonic] !== undefined &&
    process.env[envNames.authDerivationPath] !== undefined
  ) {
    const baseMnemonic = process.env[envNames.didMnemonic] as string
    return baseMnemonic.concat(
      process.env[envNames.authDerivationPath] as string
    )
  } else {
    return undefined
  }
}
export function generateAuthenticationKey(): Kilt.KiltKeyringPair | undefined {
  const authKeyMnemonic = readAuthenticationKeyMnemonic()
  const authKeyType =
    authKeyMnemonic === undefined
      ? undefined
      : (process.env[envNames.authKeyType] as Kilt.KeyringPair['type']) ||
        defaults.authKeyType
  if (authKeyMnemonic !== undefined) {
    return new Keyring().addFromMnemonic(
      authKeyMnemonic,
      {},
      authKeyType
    ) as Kilt.KiltKeyringPair
  } else {
    return undefined
  }
}

function readAttestationKeyMnemonic(): string | undefined {
  // Return the mnemonic directly, if specified
  if (process.env[envNames.attMnemonic] !== undefined) {
    return process.env[envNames.attMnemonic]
    // Otherwise use the derivation path on the basic mnemonic, if specified
  } else if (
    process.env[envNames.didMnemonic] !== undefined &&
    process.env[envNames.attDerivationPath] !== undefined
  ) {
    const baseMnemonic = process.env[envNames.didMnemonic] as string
    return baseMnemonic.concat(
      process.env[envNames.attDerivationPath] as string
    )
  } else {
    return undefined
  }
}
export function generateAttestationKey(): Kilt.KiltKeyringPair | undefined {
  const attKeyMnemonic = readAttestationKeyMnemonic()
  const attKeyType =
    attKeyMnemonic === undefined
      ? undefined
      : (process.env[envNames.attKeyType] as Kilt.KeyringPair['type']) ||
        defaults.attKeyType
  if (attKeyMnemonic !== undefined) {
    return new Keyring().addFromMnemonic(
      attKeyMnemonic,
      {},
      attKeyType
    ) as Kilt.KiltKeyringPair
  } else {
    return undefined
  }
}

function readDelegationKeyMnemonic(): string | undefined {
  // Return the mnemonic directly, if specified
  if (process.env[envNames.delMnemonic] !== undefined) {
    return process.env[envNames.delMnemonic]
    // Otherwise use the derivation path on the basic mnemonic, if specified
  } else if (
    process.env[envNames.didMnemonic] !== undefined &&
    process.env[envNames.delDerivationPath] !== undefined
  ) {
    const baseMnemonic = process.env[envNames.didMnemonic] as string
    return baseMnemonic.concat(
      process.env[envNames.delDerivationPath] as string
    )
  } else {
    return undefined
  }
}
export function generateDelegationKey(): Kilt.KiltKeyringPair | undefined {
  const delKeyMnemonic = readDelegationKeyMnemonic()
  const delKeyType =
    delKeyMnemonic === undefined
      ? undefined
      : (process.env[envNames.delKeyType] as Kilt.KeyringPair['type']) ||
        defaults.delKeyType
  if (delKeyMnemonic !== undefined) {
    return new Keyring().addFromMnemonic(
      delKeyMnemonic,
      {},
      delKeyType
    ) as Kilt.KiltKeyringPair
  } else {
    return undefined
  }
}

function readNewAuthenticationKeyMnemonic(): string | undefined {
  // Return the mnemonic directly, if specified
  if (process.env[envNames.newAuthMnemonic] !== undefined) {
    return process.env[envNames.newAuthMnemonic]
    // Otherwise use the derivation path on the basic mnemonic, if specified
  } else if (
    process.env[envNames.didMnemonic] !== undefined &&
    process.env[envNames.newAuthDerivationPath] !== undefined
  ) {
    const baseMnemonic = process.env[envNames.didMnemonic] as string
    return baseMnemonic.concat(
      process.env[envNames.newAuthDerivationPath] as string
    )
  } else {
    return undefined
  }
}
export function generateNewAuthenticationKey():
  | Kilt.KiltKeyringPair
  | undefined {
  const authKeyMnemonic = readNewAuthenticationKeyMnemonic()
  const authKeyType =
    authKeyMnemonic === undefined
      ? undefined
      : (process.env[envNames.newAuthKeyType] as Kilt.KeyringPair['type']) ||
        defaults.authKeyType
  if (authKeyMnemonic !== undefined) {
    return new Keyring().addFromMnemonic(
      authKeyMnemonic,
      {},
      authKeyType
    ) as Kilt.KiltKeyringPair
  } else {
    return undefined
  }
}

export function generatePolkadotJSLink(
  wsAddress: string,
  encodedExtrinsic: `0x${string}`
): string {
  return `https://polkadot.js.org/apps/?rpc=${wsAddress}#/extrinsics/decode/${encodedExtrinsic}`
}
