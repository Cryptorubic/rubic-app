import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { TranslateService } from '@ngx-translate/core';
import InstantTradeToken from '../models/InstantTradeToken';
import InstantTrade from '../models/InstantTrade';
import InsufficientFundsError from '../../../../shared/models/errors/instant-trade/InsufficientFundsError';
import { Web3Public } from '../../../../core/services/blockchain/web3-public-service/Web3Public';
import { Web3PrivateService } from '../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { MetamaskError } from '../../../../shared/models/errors/provider/MetamaskError';
import { AccountError } from '../../../../shared/models/errors/provider/AccountError';
import { NetworkError } from '../../../../shared/models/errors/provider/NetworkError';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

abstract class InstantTradeService {
  protected isTestingMode;

  protected web3Public: Web3Public;

  protected web3Private: Web3PrivateService;

  constructor(protected readonly translateService: TranslateService) {}

  /**
   * @description calculate instant trade parameters
   * @param fromAmount input amount in absolute value (no pre-multiplied by decimals)
   * @param fromToken input token or blockchain native coin
   * @param toToken output token or blockchain native coin
   * @param gasOptimization should use gasOptimization
   * @return parameters of possible trade
   */
  public abstract calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    gasOptimization?: boolean
  ): Promise<InstantTrade>;

  /**
   * @description create real trade with calculated parameters and resolve the promise when the trade transaction is included in the block
   * @param trade instant trade parameters
   * @param [options] additional options
   * @param [options.onConfirm] callback to execute when trade transaction enters the mempool
   * @param [options.onApprove] callback to execute when approve transaction enters the mempool. i
   *  If the account already has the required allowance, then this callback will be called with a hash equal to null
   */
  public abstract createTrade(
    trade: InstantTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string | null) => void;
    }
  ): Promise<TransactionReceipt>;

  protected checkSettings(selectedBlockchain: BLOCKCHAIN_NAME) {
    if (!this.web3Private.isProviderActive) {
      throw new MetamaskError(this.translateService);
    }

    if (!this.web3Private.address) {
      throw new AccountError(this.translateService);
    }
    if (
      this.web3Private.networkName !== selectedBlockchain &&
      (this.web3Private.networkName !== `${selectedBlockchain}_TESTNET` || !this.isTestingMode)
    ) {
      throw new NetworkError(selectedBlockchain, this.translateService);
    }
  }

  protected async checkBalance(trade: InstantTrade): Promise<void> {
    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      const balance = await this.web3Public.getBalance(this.web3Private.address, {
        inWei: true
      });
      if (balance.lt(amountIn)) {
        const formattedBalance = this.web3Public.weiToEth(balance);
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedBalance,
          trade.from.amount.toString(),
          this.translateService
        );
      }
    } else {
      const tokensBalance = await this.web3Public.getTokenBalance(
        this.web3Private.address,
        trade.from.token.address
      );
      if (tokensBalance.lt(amountIn)) {
        const formattedTokensBalance = tokensBalance
          .div(10 ** trade.from.token.decimals)
          .toString();
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedTokensBalance,
          trade.from.amount.toString(),
          this.translateService
        );
      }
    }
  }

  protected async provideAllowance(
    tokenAddress: string,
    value: BigNumber,
    targetAddress: string,
    onApprove?: (hash: string) => void
  ): Promise<void> {
    const allowance = await this.web3Public.getAllowance(
      tokenAddress,
      this.web3Private.address,
      targetAddress
    );
    if (value.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3Private.approveTokens(tokenAddress, targetAddress, uintInfinity, {
        onTransactionHash: onApprove
      });
    }
  }
}

export default InstantTradeService;
