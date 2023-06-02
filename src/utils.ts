import type { BN } from '@polkadot/util'
import type { Call } from '@polkadot/types/interfaces'

import { ApiPromise, Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { u8aToHex } from '@polkadot/util'

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
  consumerWsAddress: 'CONSUMER_WS_ADDRESS',
  verificationMethod: 'VERIFICATION_METHOD',
  identityDetailsType: 'IDENTITY_DETAILS',
  accountIdType: 'ACCOUNT_ID',
}

type Defaults = {
  wsAddress: string
  authKeyType: Kilt.KeyringPair['type']
  attKeyType: Kilt.KeyringPair['type']
  delKeyType: Kilt.KeyringPair['type']
  identityDetailsType: string
  accountIdType: string
}

export const defaults: Defaults = {
  wsAddress: 'wss://spiritnet.kilt.io',
  authKeyType: 'sr25519',
  attKeyType: 'sr25519',
  delKeyType: 'sr25519',
  identityDetailsType: 'u128',
  accountIdType: 'AccountId32',
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

const validValues: Set<Kilt.VerificationKeyRelationship> = new Set([
  'authentication',
  'assertionMethod',
  'capabilityDelegation',
])
export function parseVerificationMethod(): Kilt.VerificationKeyRelationship {
  const verificationMethod = process.env[envNames.verificationMethod]
  if (verificationMethod === undefined) {
    throw new Error(`No ${envNames.verificationMethod} env variable specified.`)
  }
  const castedVerificationMethod =
    verificationMethod as Kilt.VerificationKeyRelationship
  if (validValues.has(castedVerificationMethod)) {
    return castedVerificationMethod
  } else {
    throw new Error(
      `Provided value for ${envNames.verificationMethod} does not match any of the expected values: ${validValues}.`
    )
  }
}

export async function generateDipTxSignature(
  api: ApiPromise,
  did: Kilt.DidUri,
  call: Call,
  submitterAccount: KeyringPair['address'],
  didKeyRelationship: Kilt.VerificationKeyRelationship,
  sign: Kilt.SignExtrinsicCallback
): Promise<[Kilt.Did.EncodedSignature, BN]> {
  const isDipCapable = api.tx.dipConsumer.dispatchAs !== undefined
  if (!isDipCapable) {
    throw new Error(`The target chain at does not seem to support DIP.`)
  }
  const blockNumber = await api.query.system.number()
  console.log(`DIP signature targeting block number: ${blockNumber.toHuman()}`)
  const genesisHash = await api.query.system.blockHash(0)
  console.log(`DIP consumer genesis hash: ${genesisHash.toHuman()}`)
  const identityDetails = await api.query.dipConsumer.identityEntries(
    Kilt.Did.toChain(did)
  )
  const identityDetailsType =
    process.env[envNames.identityDetailsType] ?? defaults.identityDetailsType
  console.log(
    `DIP subject identity details on consumer chain: ${JSON.stringify(
      identityDetails,
      null,
      2
    )} with runtime type "${identityDetailsType}"`
  )
  const accountIdType =
    process.env[envNames.accountIdType] ?? defaults.accountIdType
  console.log(`DIP AccountId runtime type: "${accountIdType}"`)
  const signaturePayload = api
    .createType(
      `(Call, ${identityDetailsType}, ${accountIdType}, BlockNumber, Hash)`,
      [
        call,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (identityDetails as any).details,
        submitterAccount,
        blockNumber,
        genesisHash,
      ]
    )
    .toU8a()
  console.log(`Encoded payload for signing: ${u8aToHex(signaturePayload)}`)
  const signature = await sign({
    data: signaturePayload,
    keyRelationship: didKeyRelationship,
    did,
  })
  return [
    {
      [signature.keyType]: signature.signature,
    } as Kilt.Did.EncodedSignature,
    blockNumber.toBn(),
  ]
}

export function hexifyDipSignature(signature: Kilt.Did.EncodedSignature) {
  const [signatureType, byteSignature] = Object.entries(signature)[0]
  const hexifiedSignature = {
    [signatureType]: u8aToHex(byteSignature),
  }
  return hexifiedSignature
}
