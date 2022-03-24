import * as Kilt from '@kiltprotocol/sdk-js'
import Keyring from '@polkadot/keyring'
import { encodeAddress } from '@polkadot/util-crypto'

import * as utils from './utils'

async function main() {
  const { api } = await utils.config()
  const keystore = new Kilt.Did.DemoKeystore()
  const keyring = new Keyring({ ss58Format: 38, type: 'sr25519' })
  
  const didSeed = process.env.DID_SEED
  if (!didSeed) {
    throw `No DID_SEED env variable specified.`
  }

  const fundsMnemonic = process.env.FUNDS_MNEMONIC
  if (!fundsMnemonic) {
    throw `No FUNDS_MNEMONIC env variable specified.`
  }

  const fundsAccount = keyring.addFromMnemonic(fundsMnemonic)
  console.log(`KILT account which will pay for the tx submission fee: ${fundsAccount.address}`)

  // Re-generate keypair, supports only Sr25519
  const { publicKey } = await keystore.generateKeypair({ alg: Kilt.Did.SigningAlgorithms.Sr25519, seed: didSeed })
  const didIdentifier = encodeAddress(publicKey, 38)
  // Fetch DID details from the chain
  const fullDidDetails = await Kilt.Did.FullDidDetails.fromChainInfo(didIdentifier)
  if (!fullDidDetails) {
    throw `Cannot find DID with identifier ${didIdentifier} on chain.`
  }
  console.log(`Re-created DID: ${fullDidDetails.did}`)

  const releaseWeb3NameTx = await Kilt.Did.Web3Names.getReleaseByOwnerTx().then((tx) => fullDidDetails!.authorizeExtrinsic(tx, keystore, fundsAccount.address))

  if (process.env.SUBMIT_RESULT?.toLowerCase() === 'true') {
    console.log('Submitting tx...')
    await Kilt.BlockchainUtils.signAndSubmitTx(releaseWeb3NameTx, fundsAccount)
    console.log('Tx submitted!')
  } else {
    const encodedTx = releaseWeb3NameTx.toHex()
    console.log(`Tx hex: ${encodedTx}`)
  }
}

main().catch((e) => console.error(e)).then(() => process.exit(0))