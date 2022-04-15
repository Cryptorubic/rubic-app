import { BigNumber } from 'bignumber.js';
import { BlockchainTokenExtended } from '@shared/models/tokens/blockchain-token-extended';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { BIG_NUMBER_FORMAT } from '@shared/constants/formats/big-number-format';
import InsufficientFundsError from '@core/errors/models/instant-trade/insufficient-funds-error';

export abstract class Web3Public<AllowanceParams, TransactionResponse> {
  public abstract readonly nativeTokenAddress: string;

  public abstract getAllowance(...params: AllowanceParams[]): Promise<BigNumber>;

  public abstract isAddressCorrect(address: string): boolean;

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

  public isNativeAddress(address: string): boolean {
    return address === this.nativeTokenAddress;
  }

  /**
   * Checks if the specified address contains the required amount of these tokens.
   * Throws an InsufficientFundsError if the balance is insufficient.
   * @param token Token balance for which you need to check.
   * @param amount Required balance.
   * @param userAddress The address where the required balance should be.
   */
  public async checkBalance(
    token: { address: string; symbol: string; decimals: number },
    amount: BigNumber,
    userAddress: string
  ): Promise<void> {
    const balance = await this.getTokenOrNativeBalance(userAddress, token.address);
    const amountAbsolute = Web3Pure.toWei(amount, token.decimals);

    if (balance.lt(amountAbsolute)) {
      const formattedTokensBalance = Web3Pure.fromWei(balance, token.decimals).toFormat(
        BIG_NUMBER_FORMAT
      );
      throw new InsufficientFundsError(
        token.symbol,
        formattedTokensBalance,
        amount.toFormat(BIG_NUMBER_FORMAT)
      );
    }
  }
}
