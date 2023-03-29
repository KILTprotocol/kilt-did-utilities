import * as Kilt from '@kiltprotocol/sdk-js'

import * as utils from './utils'

async function main() {
  const api = await Kilt.connect(utils.readWsAddress())

  const submitterAddress = process.env.SUBMITTER_ADDRESS as Kilt.KiltAddress
  if (!submitterAddress) {
    throw new Error(`No ${utils.envNames.submitterAddress} env variable specified.`)
  }

  // Re-create DID auth key
  const authKey = utils.generateAuthenticationKey()
  if (authKey === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `DID authentication key mnemonic could not be found. Please specify one of the following variables: '${utils.envNames.authMnemonic}', '${utils.envNames.authDerivationPath} depending on the use case.'
    `)
  }
  const didUri = utils.generateDidUri()
  if (didUri === undefined) {
    throw new Error(
      // eslint-disable-next-line max-len
      `DID URI could not be parsed. Either specify one with "${utils.envNames.didUri}" or provide the mnemonic for the authentication key, if it has never been changed for the DID.`
    )
  }

  const fullDid: Kilt.DidDocument = {
    uri: didUri,
    authentication: [
      {
        ...authKey,
        // Not needed
        id: '#key',
      },
    ],
  }

  const web3Name = process.env[utils.envNames.web3Name]

  if (web3Name === undefined) {
    throw new Error(`No ${utils.envNames.web3Name} env variable specified.`)
  }
  const claimWeb3NameTx = await api.tx.web3Names.claim(web3Name)
  const authorizedClaimWeb3NameTx = await Kilt.Did.authorizeTx(
    fullDid.uri,
    claimWeb3NameTx,
    utils.getKeypairTxSigningCallback(authKey),
    submitterAddress
  )

  const encodedOperation = authorizedClaimWeb3NameTx.toHex()
  console.log(
    `Encoded web3name claiming operation: ${encodedOperation}. Please submit this via PolkadotJS with the account provided here.`
  )
}

main()
  .catch((e) => console.error(e))
  .then(() => process.exit(0))
