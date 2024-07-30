/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  DidUrl,
  MultibaseKeyPair,
  SignatureVerificationRelationship,
  VerificationMethod,
  VerificationRelationship,
} from '@kiltprotocol/types'
import type { BN } from '@polkadot/util'
import type { Call } from '@polkadot/types/interfaces'
import type { Codec } from '@polkadot/types/types'
import type { Result } from '@polkadot/types'

import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { blake2AsHex } from '@polkadot/util-crypto'
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
  providerWsAddress: 'PROVIDER_WS_ADDRESS',
  relayWsAddress: 'RELAY_WS_ADDRESS',
  verificationMethod: 'VERIFICATION_METHOD',
  identityDetailsType: 'IDENTITY_DETAILS',
  accountIdType: 'ACCOUNT_ID',
  blockNumberType: 'BLOCK_NUMBER',
  includeWeb3Name: 'INCLUDE_WEB3NAME',
  dipProofVersion: 'DIP_PROOF_VERSION',
}

type Defaults = {
  wsAddress: string
  authKeyType: KeyringPair['type']
  attKeyType: KeyringPair['type']
  delKeyType: KeyringPair['type']
  identityDetailsType: string
  accountIdType: string
  blockNumberType: string
  includeWeb3Name: boolean
  dipProofVersion: number
}

export const defaults: Defaults = {
  wsAddress: 'wss://spiritnet.kilt.io',
  authKeyType: 'sr25519',
  attKeyType: 'sr25519',
  delKeyType: 'sr25519',
  identityDetailsType: 'Option<u128>',
  accountIdType: 'AccountId32',
  blockNumberType: 'u64',
  includeWeb3Name: false,
  dipProofVersion: 0,
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
export function generateAuthenticationKey(): MultibaseKeyPair | undefined {
  const authKeyMnemonic = readAuthenticationKeyMnemonic()
  const authKeyType =
    authKeyMnemonic === undefined
      ? undefined
      : (process.env[envNames.authKeyType] as KeyringPair['type']) ||
        defaults.authKeyType
  if (authKeyMnemonic !== undefined) {
    return Kilt.generateKeypair({ seed: authKeyMnemonic, type: authKeyType })
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
export function generateAttestationKey(): MultibaseKeyPair | undefined {
  const attKeyMnemonic = readAttestationKeyMnemonic()
  const attKeyType =
    attKeyMnemonic === undefined
      ? undefined
      : (process.env[envNames.attKeyType] as KeyringPair['type']) ||
        defaults.attKeyType
  if (attKeyMnemonic !== undefined) {
    return Kilt.generateKeypair({ seed: attKeyMnemonic, type: attKeyType })
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
export function generateDelegationKey(): MultibaseKeyPair | undefined {
  const delKeyMnemonic = readDelegationKeyMnemonic()
  const delKeyType =
    delKeyMnemonic === undefined
      ? undefined
      : (process.env[envNames.delKeyType] as KeyringPair['type']) ||
        defaults.delKeyType
  if (delKeyMnemonic !== undefined) {
    return Kilt.generateKeypair({ seed: delKeyMnemonic, type: delKeyType })
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
export function generateNewAuthenticationKey(): MultibaseKeyPair | undefined {
  const authKeyMnemonic = readNewAuthenticationKeyMnemonic()
  const authKeyType =
    authKeyMnemonic === undefined
      ? undefined
      : (process.env[envNames.newAuthKeyType] as KeyringPair['type']) ||
        defaults.authKeyType
  if (authKeyMnemonic !== undefined) {
    return Kilt.generateKeypair({ seed: authKeyMnemonic, type: authKeyType })
  } else {
    return undefined
  }
}

const validValues: Set<SignatureVerificationRelationship> = new Set([
  'authentication',
  'assertionMethod',
  'capabilityDelegation',
])
export function parseVerificationMethod(): SignatureVerificationRelationship {
  const verificationMethod = process.env[envNames.verificationMethod]
  if (verificationMethod === undefined) {
    throw new Error(`No ${envNames.verificationMethod} env variable specified.`)
  }
  const castedVerificationMethod =
    verificationMethod as SignatureVerificationRelationship
  if (validValues.has(castedVerificationMethod)) {
    return castedVerificationMethod
  } else {
    throw new Error(
      `Provided value for ${envNames.verificationMethod} does not match any of the expected values: ${validValues}.`
    )
  }
}

export async function generateSiblingDipTx(
  relayApi: ApiPromise,
  providerApi: ApiPromise,
  consumerApi: ApiPromise,
  did: DidUrl,
  call: Call,
  submitterAccount: KeyringPair['address'],
  keyId: VerificationMethod['id'],
  didKeyRelationship: VerificationRelationship,
  includeWeb3Name: boolean,
  version: number,
  sign: SignExtrinsicCallback
): Promise<Kilt.SubmittableExtrinsic> {
  const signature = await generateDipTxSignature(
    consumerApi,
    did,
    call,
    submitterAccount,
    didKeyRelationship,
    sign
  )

  const providerChainId = await providerApi.query.parachainInfo.parachainId()
  console.log(`Provider chain has para ID = ${providerChainId.toHuman()}.`)
  const providerFinalizedBlockHash =
    await providerApi.rpc.chain.getFinalizedHead()
  const providerFinalizedBlockNumber = await providerApi.rpc.chain
    .getHeader(providerFinalizedBlockHash)
    .then((h) => h.number)
  console.log(
    `DIP action targeting the last finalized identity provider block with hash:
    ${providerFinalizedBlockHash}
    and number
    ${providerFinalizedBlockNumber}.`
  )
  const relayParentBlockHeight = await providerApi
    .at(providerFinalizedBlockHash)
    .then((api) => api.query.parachainSystem.lastRelayChainBlockNumber())
  const relayParentBlockHash = await relayApi.rpc.chain.getBlockHash(
    relayParentBlockHeight
  )
  console.log(
    `Relay chain block the identity provider block was anchored to:
    ${relayParentBlockHeight.toHuman()}
    with hash
    ${relayParentBlockHash.toHuman()}.`
  )

  const { proof: relayProof } = await relayApi.rpc.state.getReadProof(
    [relayApi.query.paras.heads.key(providerChainId)],
    relayParentBlockHash
  )

  // Proof of commitment must be generated with the state root at the block before the last one finalized.
  const previousBlockHash = await providerApi.rpc.chain.getBlockHash(
    providerFinalizedBlockNumber.toNumber() - 1
  )
  console.log(
    `Using previous provider block hash for the state proof generation: ${previousBlockHash.toHex()}.`
  )
  const { proof: paraStateProof } = await providerApi.rpc.state.getReadProof(
    [
      providerApi.query.dipProvider.identityCommitments.key(
        Kilt.Did.toChain(did),
        version
      ),
    ],
    previousBlockHash
  )
  console.log(
    `DIP proof v${version} generated for the DID key ${keyId.substring(
      1
    )} (${didKeyRelationship}).`
  )
  const dipProof =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (
      (await providerApi.call.dipProvider.generateProof({
        identifier: Kilt.Did.toChain(did),
        version,
        keys: [keyId.substring(1)],
        accounts: [],
        shouldIncludeWeb3Name: includeWeb3Name,
        // TODO: Improve this line below
      })) as Result<Codec, Codec>
    ).asOk as any
  providerApi.disconnect()

  const extrinsic = consumerApi.tx.dipConsumer.dispatchAs(
    Kilt.Did.toChain(did),
    {
      [`V${version}`]: {
        paraStateRoot: {
          relayBlockHeight: relayParentBlockHeight,
          proof: relayProof,
        },
        dipIdentityCommitment: paraStateProof,
        did: {
          leaves: {
            blinded: dipProof.proof.blinded,
            revealed: dipProof.proof.revealed,
          },
          signature: {
            signature: signature[0],
            blockNumber: signature[1],
          },
        },
      },
    },
    call
  )

  return extrinsic
}

export async function generateParentDipTx(
  relayApi: ApiPromise,
  providerApi: ApiPromise,
  did: Kilt.DidUri,
  call: Call,
  submitterAccount: KeyringPair['address'],
  keyId: Kilt.DidVerificationKey['id'],
  didKeyRelationship: Kilt.VerificationKeyRelationship,
  includeWeb3Name: boolean,
  version: number,
  sign: Kilt.SignExtrinsicCallback
): Promise<Kilt.SubmittableExtrinsic> {
  const signature = await generateDipTxSignature(
    relayApi,
    did,
    call,
    submitterAccount,
    didKeyRelationship,
    sign
  )

  const providerChainId = await providerApi.query.parachainInfo.parachainId()
  console.log(`Provider chain has para ID = ${providerChainId.toHuman()}.`)
  const providerFinalizedBlockHash =
    await providerApi.rpc.chain.getFinalizedHead()
  const providerFinalizedBlockNumber = await providerApi.rpc.chain
    .getHeader(providerFinalizedBlockHash)
    .then((h) => h.number)
  console.log(
    `DIP action targeting the last finalized identity provider block with hash:
    ${providerFinalizedBlockHash}
    and number
    ${providerFinalizedBlockNumber}.`
  )
  const relayParentBlockHeight = await providerApi
    .at(providerFinalizedBlockHash)
    .then((api) => api.query.parachainSystem.lastRelayChainBlockNumber())
  const relayParentBlockHash = await relayApi.rpc.chain.getBlockHash(
    relayParentBlockHeight
  )
  console.log(
    `Relay chain block the identity provider block was anchored to:
    ${relayParentBlockHeight.toHuman()}
    with hash
    ${relayParentBlockHash.toHuman()}.`
  )

  const { proof: relayProof } = await relayApi.rpc.state.getReadProof(
    [relayApi.query.paras.heads.key(providerChainId)],
    relayParentBlockHash
  )

  const header = await relayApi.rpc.chain.getHeader(relayParentBlockHash)
  console.log(
    `Header for the relay at block ${relayParentBlockHeight} (${relayParentBlockHash}): ${JSON.stringify(
      header,
      null,
      2
    )}`
  )

  // Proof of commitment must be generated with the state root at the block before the last one finalized.
  const previousBlockHash = await providerApi.rpc.chain.getBlockHash(
    providerFinalizedBlockNumber.toNumber() - 1
  )
  console.log(
    `Using previous provider block hash for the state proof generation: ${previousBlockHash.toHex()}.`
  )
  const { proof: paraStateProof } = await providerApi.rpc.state.getReadProof(
    [
      providerApi.query.dipProvider.identityCommitments.key(
        Kilt.Did.toChain(did),
        version
      ),
    ],
    previousBlockHash
  )
  console.log(
    `DIP proof v${version} generated for the DID key ${keyId.substring(
      1
    )} (${didKeyRelationship}).`
  )
  const dipProof =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (
      (await providerApi.call.dipProvider.generateProof({
        identifier: Kilt.Did.toChain(did),
        version,
        keys: [keyId.substring(1)],
        accounts: [],
        shouldIncludeWeb3Name: includeWeb3Name,
        // TODO: Improve this line below
      })) as Result<Codec, Codec>
    ).asOk as any
  providerApi.disconnect()

  const extrinsic = relayApi.tx.dipConsumer.dispatchAs(
    Kilt.Did.toChain(did),
    {
      [`V${version}`]: {
        paraStateRoot: {
          relayBlockHeight: relayParentBlockHeight,
          proof: relayProof,
        },
        header: {
          ...header.toJSON(),
        },
        dipIdentityCommitment: paraStateProof,
        did: {
          leaves: {
            blinded: dipProof.proof.blinded,
            revealed: dipProof.proof.revealed,
          },
          signature: {
            signature: signature[0],
            blockNumber: signature[1],
          },
        },
      },
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
  const identityDetails =
    (await api.query.dipConsumer.identityEntries(
      Kilt.Did.toChain(did)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    )) || api.createType(identityDetailsType, null)
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
      [call, identityDetails, submitterAccount, blockNumber, genesisHash]
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

export function computeDidKeyId(
  api: ApiPromise,
  publicKey: Kilt.KeyringPair['publicKey'],
  keyType: Kilt.DidKey['type']
): Kilt.DidKey['id'] {
  const didEncodedKey = api.createType('DidDidDetailsDidPublicKey', {
    publicVerificationKey: {
      [keyType]: publicKey,
    },
  })
  return `#${blake2AsHex(didEncodedKey.toU8a(), 256)}`
}

export function generatePolkadotJSLink(
  wsAddress: string,
  encodedExtrinsic: `0x${string}`
): string {
  return `https://polkadot.js.org/apps/?rpc=${wsAddress}#/extrinsics/decode/${encodedExtrinsic}`
}
