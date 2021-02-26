import { Injectable } from '@angular/core';
import InstantTradeService from '../InstantTradeService';
import InstantTrade from '../types/InstantTrade';
import { InstantTradeToken } from '../types';
import { ChainId, Fetcher, Route, Token, TokenAmount, Trade, TradeType, WETH } from '@uniswap/sdk';
import BigNumber from 'bignumber.js';
import { Percent } from '@uniswap/sdk';
import { Web3ApiService } from '../../web3Api/web3-api.service';
import { UniSwapContractAbi, UniSwapContractAddress } from './uni-swap-contract';
import { TransactionReceipt } from 'web3-eth';
import { RubicError } from '../../../errors/RubicError';
import InsufficientFundsError from '../../../errors/instant-trade/InsufficientFundsError';
import { CoingeckoApiService } from '../../coingecko-api/coingecko-api.service';

interface UniSwapTrade {
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

@Injectable({
  providedIn: 'root'
})
export class UniSwapService extends InstantTradeService {
  static slippageTolerance = new Percent('50', '10000'); // 0.50%
  static tokensToTokensEstimatedGas = new BigNumber(120_000);
  static tokensToEthEstimatedGas = new BigNumber(150_000);
  static ethToTokensEstimatedGas = new BigNumber(150_000);
  private readonly provider;
  private readonly WETH;

  constructor(private web3Api: Web3ApiService, private coingeckoApiService: CoingeckoApiService) {
    super();
    this.provider = web3Api.ethersProvider;

    this.WETH = WETH[this.web3Api.network.id.toString()];
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    chainId?
  ): Promise<InstantTrade> {
    try {
      const fromTokenClone = { ...fromToken };
      const toTokenClone = { ...toToken };
      let estimatedGasPredictionMethod = 'calculateTokensToTokensGasLimit';

      if (this.web3Api.isEtherAddress(fromTokenClone.address)) {
        fromTokenClone.address = this.WETH.address;
        estimatedGasPredictionMethod = 'calculateEthToTokensGasLimit';
      }

      if (this.web3Api.isEtherAddress(toTokenClone.address)) {
        toTokenClone.address = this.WETH.address;
        estimatedGasPredictionMethod = 'calculateTokensToEthGasLimit';
      }

      const uniSwapTrade = await this.getUniSwapTrade(
        fromAmount,
        fromTokenClone,
        toTokenClone,
        chainId
      );

      const amountIn = new BigNumber(
        uniSwapTrade.inputAmount.toSignificant(fromTokenClone.decimals)
      )
        .multipliedBy(10 ** fromTokenClone.decimals)
        .toFixed(0);
      const amountOutMin = new BigNumber(
        uniSwapTrade
          .minimumAmountOut(UniSwapService.slippageTolerance)
          .toSignificant(toTokenClone.decimals)
      )
        .multipliedBy(10 ** toTokenClone.decimals)
        .toFixed(0);

      const path = [fromTokenClone.address, toTokenClone.address];
      const to = this.web3Api.address;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

      const estimatedGas = await this[estimatedGasPredictionMethod](
        amountIn,
        amountOutMin,
        path,
        to,
        deadline
      );

      const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();

      const gasFeeInUsd = await this.web3Api.getGasFee(estimatedGas, ethPrice);
      const gasFeeInEth = await this.web3Api.getGasFee(estimatedGas, new BigNumber(1));
      const amountOut = uniSwapTrade
        .minimumAmountOut(new Percent('0', '1'))
        .toSignificant(toTokenClone.decimals);

      return {
        from: {
          token: fromToken,
          amount: fromAmount
        },
        to: {
          token: toToken,
          amount: new BigNumber(amountOut)
        },
        estimatedGas,
        gasFeeInUsd,
        gasFeeInEth
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private async calculateTokensToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    to: string,
    deadline: number
  ): Promise<BigNumber> {
    let estimatedGas = UniSwapService.tokensToTokensEstimatedGas;
    const allowance = await this.web3Api.getAllowance(path[0], UniSwapContractAddress);
    const balance = await this.web3Api.getTokenBalance(path[0]);
    if (allowance.gte(amountIn) && balance.gte(amountIn)) {
      estimatedGas = await this.web3Api.getEstimatedGas(
        UniSwapContractAbi,
        UniSwapContractAddress,
        SWAP_METHOD.TOKENS_TO_TOKENS,
        [amountIn, amountOutMin, path, to, deadline]
      );
    }
    return estimatedGas;
  }

  private async calculateEthToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    to: string,
    deadline: number
  ): Promise<BigNumber> {
    const balance = await this.web3Api.getBalance();
    return balance.gte(amountIn)
      ? this.web3Api.getEstimatedGas(
          UniSwapContractAbi,
          UniSwapContractAddress,
          SWAP_METHOD.ETH_TO_TOKENS,
          [amountOutMin, path, to, deadline],
          amountIn
        )
      : UniSwapService.ethToTokensEstimatedGas;
  }

  private async calculateTokensToEthGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    to: string,
    deadline: number
  ): Promise<BigNumber> {
    let estimatedGas = UniSwapService.tokensToEthEstimatedGas;
    const allowance = await this.web3Api.getAllowance(path[0], UniSwapContractAddress);
    const balance = await this.web3Api.getTokenBalance(path[0]);
    if (allowance.gte(amountIn) && balance.gte(amountIn)) {
      estimatedGas = await this.web3Api.getEstimatedGas(
        UniSwapContractAbi,
        UniSwapContractAddress,
        SWAP_METHOD.TOKENS_TO_ETH,
        [amountIn, amountOutMin, path, to, deadline]
      );
    }
    return estimatedGas;
  }

  public async createTrade(
    trade: InstantTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.checkBalance(trade);
    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(
      100
    );
    const amountOutMin = trade.to.amount
      .multipliedBy(new BigNumber(1).minus(percentSlippage))
      .multipliedBy(10 ** trade.to.token.decimals)
      .toFixed(0);
    const path = [trade.from.token.address, trade.to.token.address];
    const to = this.web3Api.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const uniSwapTrade: UniSwapTrade = { amountIn, amountOutMin, path, to, deadline };

    if (this.web3Api.isEtherAddress(trade.from.token.address)) {
      return this.createEthToTokensTrade(uniSwapTrade, options);
    }

    if (this.web3Api.isEtherAddress(trade.to.token.address)) {
      return this.createTokensToEthTrade(uniSwapTrade, options);
    }

    return this.createTokensToTokensTrade(uniSwapTrade, options);
  }

  private async createEthToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    trade.path[0] = this.WETH.address;

    return this.web3Api.executeContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      SWAP_METHOD.ETH_TO_TOKENS,
      [trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        value: trade.amountIn
      }
    );
  }

  private async createTokensToEthTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    trade.path[1] = this.WETH.address;

    await this.provideAllowance(trade.path[0], new BigNumber(trade.amountIn), options.onApprove);

    return this.web3Api.executeContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      SWAP_METHOD.TOKENS_TO_ETH,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm
      }
    );
  }

  private async createTokensToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.provideAllowance(trade.path[0], new BigNumber(trade.amountIn), options.onApprove);

    return this.web3Api.executeContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      SWAP_METHOD.TOKENS_TO_TOKENS,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      { onTransactionHash: options.onConfirm }
    );
  }

  private async provideAllowance(
    tokenAddress: string,
    value: BigNumber,
    onApprove?: (hash: string) => void
  ): Promise<void> {
    const allowance = await this.web3Api.getAllowance(tokenAddress, UniSwapContractAddress);
    if (value.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3Api.approveTokens(tokenAddress, UniSwapContractAddress, uintInfinity, {
        onTransactionHash: onApprove
      });
    }
  }

  private async checkBalance(trade: InstantTrade): Promise<void> {
    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    if (this.web3Api.isEtherAddress(trade.from.token.address)) {
      const balance = await this.web3Api.getBalance({ inWei: true });
      if (balance.lt(amountIn)) {
        const formattedBalance = this.web3Api.weiToEth(balance);
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedBalance,
          trade.from.amount.toString()
        );
      }
    } else {
      const tokensBalance = await this.web3Api.getTokenBalance(trade.from.token.address);
      if (tokensBalance.lt(amountIn)) {
        const formattedTokensBalance = tokensBalance
          .div(10 ** trade.from.token.decimals)
          .toString();
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedTokensBalance,
          trade.from.amount.toString()
        );
      }
    }
  }

  private async getUniSwapTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    chainId?
  ): Promise<Trade> {
    const uniSwapFromToken = new Token(
      chainId || ChainId.MAINNET,
      fromToken.address,
      fromToken.decimals
    );
    const uniSwapToToken = new Token(chainId || ChainId.MAINNET, toToken.address, toToken.decimals);
    const pair = await Fetcher.fetchPairData(uniSwapFromToken, uniSwapToToken, this.provider);
    const route = new Route([pair], uniSwapFromToken);

    const fullFromAmount = fromAmount.multipliedBy(10 ** fromToken.decimals);

    return new Trade(
      route,
      new TokenAmount(uniSwapFromToken, fullFromAmount.toFixed(0)),
      TradeType.EXACT_INPUT
    );
  }
}
