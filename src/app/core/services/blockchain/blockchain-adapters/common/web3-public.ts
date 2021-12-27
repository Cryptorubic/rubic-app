import { BigNumber } from 'bignumber.js';
import { BlockchainTokenExtended } from '@shared/models/tokens/BlockchainTokenExtended';

export abstract class Web3Public<AllowanceParams, TransactionResponse> {
  public abstract getAllowance(...params: AllowanceParams[]): Promise<BigNumber>;

  public abstract isAddressCorrect(address: string): boolean;

  public abstract isNativeAddress(address: string): boolean;

  public abstract getTokenInfo(tokenAddress: string): Promise<BlockchainTokenExtended>;

  public abstract getTokenOrNativeBalance(
    userAddress: string,
    tokenAddress: string
  ): Promise<BigNumber>;

  public abstract getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber>;

  public abstract getTransactionByHash(
    hash: string,
    attempt?: number,
    attemptsLimit?: number,
    delay?: number
  ): Promise<TransactionResponse>;

  public abstract getTokensBalances(
    address: string,
    tokensAddresses: string[]
  ): Promise<BigNumber[]>;

  public abstract checkBalance(
    token: { address: string; symbol: string; decimals: number },
    amount: BigNumber,
    userAddress: string
  ): Promise<void>;
}
