import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeService from '../InstantTradeService';
import InstantTradeToken from '../../models/InstantTradeToken';
import InstantTrade from '../../models/InstantTrade';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PrivateService } from '../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { PancakeSwapContractAbi, PancakeSwapContractAddress } from './pancake-swap-contract';

interface PancakeSwapTrade {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: number;
}

enum SWAP_METHOD {
  TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
  ETH_TO_TOKENS = 'swapExactETHForTokens',
  TOKENS_TO_ETH = 'swapExactTokensForETH'
}

@Injectable()
export class PancakeSwapService extends InstantTradeService {
  static slippageTolerance = 0.015; // 1.5%

  private WETH = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

  constructor(web3PublicService: Web3PublicService, web3Private: Web3PrivateService) {
    super();
    this.web3Public = web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
    this.web3Private = web3Private;
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };

    if (this.web3Public.isNativeAddress(fromTokenClone.address)) {
      fromTokenClone.address = this.WETH;
    }

    if (this.web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.WETH;
    }

    const amountOut = await this.getToAmount(fromAmount, fromTokenClone, toTokenClone);

    return {
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: amountOut.div(10 ** toToken.decimals)
      },
      estimatedGas: new BigNumber(0),
      gasFeeInUsd: new BigNumber(0),
      gasFeeInEth: new BigNumber(0)
    };
  }

  public async createTrade(
    trade: InstantTrade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ): Promise<TransactionReceipt> {
    await this.checkSettings(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
    await this.checkBalance(trade);

    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    const amountOutMin = trade.to.amount
      .multipliedBy(new BigNumber(1).minus(PancakeSwapService.slippageTolerance))
      .multipliedBy(10 ** trade.to.token.decimals)
      .toFixed(0);
    const path = [trade.from.token.address, trade.to.token.address];
    const to = this.web3Private.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const pancakeSwapTrade: PancakeSwapTrade = { amountIn, amountOutMin, path, to, deadline };

    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      return this.createEthToTokensTrade(pancakeSwapTrade, options);
    }

    if (this.web3Public.isNativeAddress(trade.to.token.address)) {
      return this.createTokensToEthTrade(pancakeSwapTrade, options);
    }

    return this.createTokensToTokensTrade(pancakeSwapTrade, options);

    return Promise.resolve(undefined);
  }

  private async createEthToTokensTrade(
    trade: PancakeSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    trade.path[0] = this.WETH;

    return this.web3Private.executeContractMethod(
      PancakeSwapContractAddress,
      PancakeSwapContractAbi,
      SWAP_METHOD.ETH_TO_TOKENS,
      [trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        value: trade.amountIn
      }
    );
  }

  private async createTokensToEthTrade(
    trade: PancakeSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    trade.path[1] = this.WETH;

    await this.provideAllowance(
      trade.path[0],
      new BigNumber(trade.amountIn),
      PancakeSwapContractAddress,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      PancakeSwapContractAddress,
      PancakeSwapContractAbi,
      SWAP_METHOD.TOKENS_TO_ETH,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm
      }
    );
  }

  private async createTokensToTokensTrade(
    trade: PancakeSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.provideAllowance(
      trade.path[0],
      new BigNumber(trade.amountIn),
      PancakeSwapContractAddress,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      PancakeSwapContractAddress,
      PancakeSwapContractAbi,
      SWAP_METHOD.TOKENS_TO_TOKENS,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      { onTransactionHash: options.onConfirm }
    );
  }

  private async getToAmount(
    fromAmountRelative: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<BigNumber> {
    const absoluteAmount = fromAmountRelative.multipliedBy(10 ** fromToken.decimals).toFixed(0);
    const path = [fromToken.address, toToken.address];
    const response: string[] = await this.web3Public.callContractMethod(
      PancakeSwapContractAddress,
      PancakeSwapContractAbi,
      'getAmountsOut',
      { methodArguments: [absoluteAmount, path] }
    );

    return new BigNumber(response[1]);
  }
}
