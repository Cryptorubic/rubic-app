// transaction/util.ts

import {
  EVMGasType,
  getEVMGasTypeForTransaction,
  NetworkName,
  type RailgunERC20AmountRecipient,
  type RailgunERC20Amount,
  type RailgunNFTAmount,
  type RailgunNFTAmountRecipient,
  type TransactionGasDetails
} from '@railgun-community/shared-models';
import { getShieldPrivateKeySignatureMessage, NFTTokenType } from '@railgun-community/wallet';
import { keccak256, type HDNodeWallet, type Wallet } from 'ethers';

/**
 * Generates a shield private key signature by signing a predefined message with the provided wallet
 * and then hashing the signature with keccak256.
 *
 * @param wallet - The wallet (Wallet or HDNodeWallet) used to sign the shield signature message
 * @returns A Promise that resolves to the shield private key signature as a hex string
 */
export const getShieldSignature = async (wallet: Wallet | HDNodeWallet): Promise<string> => {
  const shieldSignatureMessage = getShieldPrivateKeySignatureMessage();
  const shieldPrivateKey = keccak256(await wallet.signMessage(shieldSignatureMessage));
  return shieldPrivateKey;
};

/**
 * Serializes token address and amount into a RailgunERC20Amount format for relay adapt unshield.ts transactions.
 *
 * @param tokenAddress - The Ethereum address of the ERC20 token
 * @param amount - The token amount as a BigInt value
 * @returns A RailgunERC20Amount object containing the token address and amount
 */
export const serializeERC20RelayAdaptUnshield = (
  tokenAddress: string,
  amount: bigint
): RailgunERC20Amount => {
  return {
    tokenAddress,
    amount
  };
};

/**
 * Serializes an ERC721 token for relay adaptation to unshield.ts it.
 *
 * This function creates a RailgunNFTAmount object that represents an ERC721 token
 * with the specified address and token ID. The amount is always set to 1 since
 * ERC721 tokens are non-fungible and can only be transferred as whole units.
 *
 * @param tokenAddress - The contract address of the ERC721 token.
 * @param tokenSubID - The unique identifier of the specific ERC721 token.
 * @returns A RailgunNFTAmount object configured for ERC721 unshielding.
 */
export const serializeERC721RelayAdaptUnshield = (
  tokenAddress: string,
  tokenSubID: string
): RailgunNFTAmount => {
  return {
    nftAddress: tokenAddress,
    amount: 1n,
    tokenSubID,
    nftTokenType: NFTTokenType.ERC721
  };
};

/**
 * Serializes ERC20 transfer data into a RailgunERC20AmountRecipient object.
 *
 * @param tokenAddress - The address of the ERC20 token contract
 * @param amount - The amount of tokens to transfer as a bigint
 * @param recipient - The address of the transfer recipient
 * @returns A RailgunERC20AmountRecipient object containing the transfer details
 */
export const serializeERC20Transfer = (
  tokenAddress: string,
  amount: bigint,
  recipient: string
): RailgunERC20AmountRecipient => {
  return {
    tokenAddress,
    amount,
    recipientAddress: recipient
  };
};

/**
 * Serializes an ERC721 NFT transfer into a RailgunNFTAmountRecipient object.
 *
 * @param nftAddress - The contract address of the ERC721 NFT
 * @param tokenSubID - The token ID of the ERC721 NFT
 * @param recipient - The address of the recipient who will receive the NFT
 * @returns A RailgunNFTAmountRecipient object representing the ERC721 transfer with amount always set to 1n
 */
export const serializeERC721Transfer = (
  nftAddress: string,
  tokenSubID: string,
  recipient: string
): RailgunNFTAmountRecipient => {
  return {
    nftAddress,
    amount: 1n, // shield amount - always 1n for ERC-721
    tokenSubID,
    nftTokenType: NFTTokenType.ERC721,
    recipientAddress: recipient
  };
};

export const getOriginalGasDetailsForTransaction = async (
  _network: NetworkName,
  _sendWithPublicWallet: boolean
): Promise<TransactionGasDetails> => {
  throw new Error('Not implemented - getOriginalGasDetailsForTransaction');
  // MOCK HANDLE WALLET MANAGEMENT AND GAS ESTIMATES
  // const { wallet } = getProviderWallet();
  // const gasDetails = await getGasDetailsForTransaction(network, 0n, sendWithPublicWallet, wallet);
  // return gasDetails;
};

/**
 * Retrieves gas details for a transaction based on network and wallet information.
 *
 * This function determines the appropriate EVM gas type for the transaction and
 * creates a structured gas details object with the necessary gas parameters.
 * For Type0 and Type1 transactions, it returns gasPrice, while for Type2 transactions,
 * it returns maxFeePerGas and maxPriorityFeePerGas according to EIP-1559.
 *
 * @param network - The blockchain network name to perform the transaction on
 * @param gasEstimate - The estimated gas amount required for the transaction as a bigint
 * @param sendWithPublicWallet - Indicates whether the transaction is being sent from a public wallet
 * @param wallet - The wallet instance used to sign and populate the transaction
 *
 * @returns A promise that resolves to a TransactionGasDetails object containing appropriate gas parameters
 * for the specified network and transaction type
 *
 * @example
 * const gasDetails = await getGasDetailsForTransaction(
 *   'ethereum',
 *   250000n,
 *   false,
 *   myWallet
 * );
 */
export const getGasDetailsForTransaction = async (
  network: NetworkName,
  gasEstimate: bigint,
  sendWithPublicWallet: boolean,
  wallet: Wallet | HDNodeWallet
) => {
  const evmGasType: EVMGasType = getEVMGasTypeForTransaction(network, sendWithPublicWallet);

  let gasDetails: TransactionGasDetails;

  // populate tx
  // send 1 wei to self. get gas details
  // THIS IS AN INSECURE WAY TO GET GAS ESTIMATE
  // DO NOT USE IN PRODUCTION
  const { maxFeePerGas, maxPriorityFeePerGas } = await wallet.populateTransaction({
    to: wallet.address,
    value: 1n
  });

  switch (evmGasType) {
    case EVMGasType.Type0:
    case EVMGasType.Type1:
      gasDetails = {
        evmGasType,
        gasEstimate,
        gasPrice: BigInt(maxFeePerGas?.valueOf() ?? 0) // Proper calculation of network gasPrice is not covered in this guide
      };
      break;
    case EVMGasType.Type2:
      // Proper calculation of gas Max Fee and gas Max Priority Fee is not covered in this guide. See: https://docs.alchemy.com/docs/how-to-build-a-gas-fee-estimator-using-eip-1559

      gasDetails = {
        evmGasType,
        gasEstimate,
        maxFeePerGas: BigInt(maxFeePerGas?.valueOf() ?? 0),
        maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas?.valueOf() ?? 0)
      };
      break;
  }
  return gasDetails;
};
