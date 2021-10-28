import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-public';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import BigNumber from 'bignumber.js';
import { Transaction } from 'web3-core';

export const WEB3_ETH_SUPPORTED_BLOCKCHAINS = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.AVALANCHE
] as const;

export type Web3EthSupportedBlockchains = typeof WEB3_ETH_SUPPORTED_BLOCKCHAINS[number];

export type GetEthTrxByHashParams = {
  hash: string;
  attempt?: number;
  attemptLimit?: number;
  delay?: number;
};

export interface GetSolanaTrxByHashParams {}

export abstract class PublicBlockchainAdapter {
  abstract getBalance(address: string, options: { inWei?: boolean }): Promise<BigNumber>;

  abstract getTokenBalance(userAddress: string, tokenAddress: string): Promise<BigNumber>;

  abstract getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]>;

  abstract isAddressCorrect(address: string): boolean;

  abstract getTokenInfo(query: string): Promise<BlockchainToken>;

  abstract isNativeAddress(address: string): boolean;

  abstract getAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<BigNumber>;

  abstract waitForTransaction(
    params: GetEthTrxByHashParams | GetSolanaTrxByHashParams
  ): Promise<Transaction | unknown>;

  abstract getTokenOrNativeBalance(userAddress: string, tokenAddress: string): Promise<BigNumber>;
}

class SolanaWeb3Public extends PublicBlockchainAdapter {
  constructor() {
    super();
  }

  async getBalance(address: string, options: { inWei?: boolean }): Promise<BigNumber> {
    console.log(address, options);
    return null;
  }

  async getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]> {
    console.log(address, tokensAddresses);
    return null;
  }

  async getTokenBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
    console.log(userAddress, tokenAddress);
    return null;
  }

  isAddressCorrect(address: string): boolean {
    return Boolean(address);
  }

  isNativeAddress(address: string): boolean {
    return Boolean(address);
  }

  async getAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<BigNumber> {
    console.log(tokenAddress, ownerAddress, spenderAddress);
    return new BigNumber(NaN);
  }

  public async getTokenInfo(query: string): Promise<BlockchainToken> {
    console.log(query);
    return null;
  }

  async waitForTransaction(
    params: GetEthTrxByHashParams | GetSolanaTrxByHashParams
  ): Promise<Transaction | {}> {
    console.log(params);
    return null;
  }

  async getTokenOrNativeBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
    console.log(userAddress, tokenAddress);
    return null;
  }
}

export type BlockchainPublicAdapter = Web3Public | null | SolanaWeb3Public;
