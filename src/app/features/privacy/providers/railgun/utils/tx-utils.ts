// transaction/util.ts

import {
  EVMGasType,
  getEVMGasTypeForTransaction,
  type RailgunERC20AmountRecipient,
  type RailgunERC20Amount,
  type TransactionGasDetails
} from '@railgun-community/shared-models';
import { getShieldPrivateKeySignatureMessage } from '@railgun-community/wallet';
import { HDNodeWallet, keccak256, Wallet } from 'ethers';
import { EvmBlockchainName, nativeTokensList, Token } from '@cryptorubic/core';
import { JsonRpcProvider } from 'ethers';
import { rpcList } from '@shared/constants/blockchain/rpc-list';
import { GasService } from '@core/services/gas-service/gas.service';
import { fromPrivateToRubicChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';
import { EIP1559Gas, SingleGasPrice } from '@cryptorubic/web3';

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
  network: PrivacySupportedNetworks,
  gasEstimate: bigint,
  sendWithPublicWallet: boolean,
  gasService: GasService
) => {
  const evmGasType: EVMGasType = getEVMGasTypeForTransaction(network, sendWithPublicWallet);
  const blockchain = fromPrivateToRubicChainMap[network];
  let gasDetails: TransactionGasDetails;
  const generalGas = await gasService.getGasPriceInEthUnits(blockchain);
  const nativeToken = nativeTokensList[blockchain];

  switch (evmGasType) {
    case EVMGasType.Type0:
    case EVMGasType.Type1: {
      const gas = generalGas as SingleGasPrice;
      const weiGas = Token.toWei(gas.gasPrice, nativeToken.decimals);

      gasDetails = {
        evmGasType,
        gasEstimate,
        gasPrice: BigInt(weiGas)
      };
      break;
    }
    case EVMGasType.Type2: {
      const gas = generalGas as EIP1559Gas;
      const weiMaxFeePerGas = Token.toWei(gas.maxFeePerGas, 9);
      const weiMaxPriorityFeePerGas = Token.toWei(gas.maxPriorityFeePerGas, 9);

      gasDetails = {
        evmGasType,
        gasEstimate,
        maxFeePerGas: BigInt(weiMaxFeePerGas),
        maxPriorityFeePerGas: BigInt(weiMaxPriorityFeePerGas)
      };
      break;
    }
  }
  return gasDetails;
};

export const getOriginalGasDetailsForTransaction = async (
  network: PrivacySupportedNetworks,
  sendWithPublicWallet: boolean,
  gasService: GasService
): Promise<TransactionGasDetails> => {
  const gasDetails = await getGasDetailsForTransaction(
    network,
    0n,
    sendWithPublicWallet,
    gasService
  );
  return gasDetails;
};

export const getProviderWallet = (
  blockchain: EvmBlockchainName,
  mnemonic: string
): {
  provider: JsonRpcProvider;
  wallet: HDNodeWallet;
} => {
  const rpc = rpcList[blockchain][0];
  const provider = new JsonRpcProvider(rpc);
  const wallet = Wallet.fromPhrase(mnemonic, provider);

  return {
    provider,
    wallet
  };
};
