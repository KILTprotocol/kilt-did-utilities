import type { BN } from '@polkadot/util'
import type { Call } from '@polkadot/types/interfaces'
import type { Codec } from '@polkadot/types/types'
import type { Result } from '@polkadot/types'

import { setTimeout } from 'timers/promises'

import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { u8aToHex } from '@polkadot/util'
import { decodeAddress } from '@polkadot/util-crypto'

import * as Kilt from '@kiltprotocol/sdk-js'
import { dipProviderCalls, types } from '@kiltprotocol/type-definitions'

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
  blockNumberType: 'BLOCK_NUMBER',
}

type Defaults = {
  wsAddress: string
  authKeyType: Kilt.KeyringPair['type']
  attKeyType: Kilt.KeyringPair['type']
  delKeyType: Kilt.KeyringPair['type']
  identityDetailsType: string
  accountIdType: string
  blockNumberType: string
}

export const defaults: Defaults = {
  wsAddress: 'wss://spiritnet.kilt.io',
  authKeyType: 'sr25519',
  attKeyType: 'sr25519',
  delKeyType: 'sr25519',
  identityDetailsType: 'u128',
  accountIdType: 'AccountId32',
  blockNumberType: 'u64',
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

export async function generateDipTx(
  api: ApiPromise,
  did: Kilt.DidUri,
  call: Call,
  submitterAccount: KeyringPair['address'],
  didKeyRelationship: Kilt.VerificationKeyRelationship,
  sign: Kilt.SignExtrinsicCallback
): Promise<Kilt.SubmittableExtrinsic> {
  const signature = await generateDipTxSignature(api, did, call, submitterAccount, didKeyRelationship, sign)
  // TODO: Remove hardcoded address
  const relayWs = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:50001') })
  // TODO: Adjust this logic
  const currentBlockNumber = (await relayWs.derive.chain.bestNumber()).toNumber()
  if (currentBlockNumber % 2 == 0) {
    console.log(`Block number ${currentBlockNumber} is even. Waiting 6 seconds then retrying.`)
    await setTimeout(6_000)
  }
  // TODO: Remove hardcoded key
  const { at: relayHash, proof: relayProof } =
    await relayWs.rpc.state.getReadProof(['0xcd710b30bd2eab0352ddcc26417aa1941b3c252fcb29d88eff4f3de5de4476c363f5a4efb16ffa83d0070000'])
  console.log(`Relaychain block hash targeted for the state proof: ${relayHash.toHex()}`)
  // We don't wait for it, but simply send the signal
  relayWs.disconnect()
  // TODO: Remove hardcoded address
  const providerWs = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:50010'), runtime: dipProviderCalls, types })
  const { at: providerHash, proof: paraStateProof } =
    // TODO: Remove hardcoded key
    // eslint-disable-next-line max-len
    await providerWs.rpc.state.getReadProof(['0xb375edf06348b4330d1e88564111cb3d5bf19e4ed2927982e234d989e812f3f3925166f4bddf5baa48435e0c89cf7c9b837846eaf6ac9f4e3a6987e963650e86d84cd8b1f0469614'])
  console.log(`Provider chain block hash targeted for the state proof: ${providerHash.toHex()}`)
  // We don't wait for it, but simply send the signal
  providerWs.disconnect()
  // TODO: Adjust the whole logic
  const dipProof = (await providerWs.call.dipProvider.generateProof({
    identifier: Kilt.Did.toChain(did),
    // TODO: Remove hardcoded value
    keys: ['0x97db64b51eabf455f2b9aa25c2f9f0ef98d2142271ff416a103b5f9c511e96db'],
    accounts: [],
    shouldIncludeWeb3Name: false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as Result<Codec, Codec>).asOk as any

  // TODO: Better creation for this extrinsic (?)
  const extrinsic = api.tx.dipConsumer.dispatchAs(
    Kilt.Did.toChain(did),
    {
      paraRootProof: relayProof,
      dipCommitmentProof: paraStateProof,
      dipProof: {
        merkleLeaves: {
          blinded: dipProof.proof.blinded,
          revealed: dipProof.proof.revealed,
        },
        didSignature: {
          signature: signature[0],
          blockNumber: signature[1],
        }
      }
    },
    call
  )

  return extrinsic
}

async function generateDipTxSignature(
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
  const identityDetailsType =
    process.env[envNames.identityDetailsType] ?? defaults.identityDetailsType
  const identityDetails = (await api.query.dipConsumer.identityEntries(
    Kilt.Did.toChain(did)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any).details || api.createType(identityDetailsType, null)
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
  const blockNumberType =
    process.env[envNames.blockNumberType] ?? defaults.blockNumberType
  console.log(`Block number runtime type: "${blockNumberType}"`)
  const signaturePayload = api
    .createType(
      `(Call, ${identityDetailsType}, ${accountIdType}, ${blockNumberType}, Hash)`,
      [
        call,
        identityDetails,
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

export function generatePolkadotJSLink(
  wsAddress: string,
  encodedExtrinsic: `0x${string}`
): string {
  return `https://polkadot.js.org/apps/?rpc=${wsAddress}#/extrinsics/decode/${encodedExtrinsic}`
}
