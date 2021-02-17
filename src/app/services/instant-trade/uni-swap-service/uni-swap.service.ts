import { Injectable } from '@angular/core';
import InstantTradeService from '../InstantTradeService';
import InstantTrade from '../types/InstantTrade';
import {InstantTradeToken} from '../types';
import {ChainId, Fetcher, Route, Token, TokenAmount, Trade, TradeType, WETH} from '@uniswap/sdk';
import BigNumber from 'bignumber.js';
import { Percent } from '@uniswap/sdk';
import {Web3ApiService} from '../../web3Api/web3-api.service';
import {UniSwapContractAbi, UniSwapContractAddress} from './uni-swap-contract';
import {TransactionReceipt} from 'web3-eth';

interface UniSwapTrade {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: number;
}

@Injectable({
  providedIn: 'root'
})
export class UniSwapService extends InstantTradeService {

  static slippageTolerance = new Percent('50', '10000'); // 0.50%
  private readonly provider;
  private readonly WETH;

  constructor(private web3Api: Web3ApiService) {
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
      const fromTokenClone = {... fromToken};
      const toTokenClone = {... toToken};

      if (this.web3Api.isEtherAddress(fromTokenClone.address)) {
        fromTokenClone.address = this.WETH.address;
      }

      if (this.web3Api.isEtherAddress(toTokenClone.address)) {
        toTokenClone.address = this.WETH.address;
      }

      const uniSwapTrade = await this.getUniSwapTrade(fromAmount, fromTokenClone, toTokenClone, chainId);

      const amountIn = new BigNumber(uniSwapTrade.inputAmount
          .toSignificant(fromTokenClone.decimals)).multipliedBy(10 ** fromTokenClone.decimals);
      const amountOutMin = new BigNumber(uniSwapTrade.minimumAmountOut(UniSwapService.slippageTolerance)
          .toSignificant(toTokenClone.decimals)).multipliedBy(10 ** toTokenClone.decimals);
      const path = [fromTokenClone.address, toTokenClone.address];
      const to = this.web3Api.address;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

      /*const estimatedGas = await this.web3Api.getEstimatedGas(
          UniSwapContractAbi,
          UniSwapContractAddress,
          'swapExactTokensForTokensSupportingFeeOnTransferTokens',
          [amountIn, amountOutMin, path, to, deadline]
          );
  */
      const estimatedGas = new BigNumber(0);
      const gasFee = await this.web3Api.getGasFeeInUSD(estimatedGas);
      const amountOut = uniSwapTrade.minimumAmountOut(new Percent('0', '1')).toSignificant(toTokenClone.decimals);

      const trade: InstantTrade = {
        from: {
          token: fromToken,
          amount: fromAmount
        },
        to: {
          token: toToken,
          amount: new BigNumber(amountOut)
        },
        estimatedGas,
        gasFee

      };
      return trade;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public async createTrade(
      trade: InstantTrade,
      options: {
        onConfirm?: (hash: string) => void,
        onApprove?: (hash: string) => void
      } = { }
    ): Promise<TransactionReceipt> {

    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);
    const percentSlippage = new BigNumber(UniSwapService.slippageTolerance.toSignificant(10)).div(100);
    const amountOutMin = trade.to.amount
        .multipliedBy(new BigNumber(1).minus(percentSlippage))
        .multipliedBy(10 ** trade.from.token.decimals)
        .toFixed(0);
    const path = [trade.from.token.address, trade.to.token.address];
    const to = this.web3Api.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const uniSwapTrade: UniSwapTrade = {amountIn, amountOutMin, path, to, deadline};

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
        onConfirm?: (hash: string) => void,
        onApprove?: (hash: string) => void
      } = { }
  ): Promise<TransactionReceipt> {

    trade.path[0] = this.WETH.address;

    return this.web3Api.executeContractMethod(
        UniSwapContractAddress,
        UniSwapContractAbi,
        'swapExactETHForTokens',
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
        onConfirm?: (hash: string) => void,
        onApprove?: (hash: string) => void
      } = { }
  ): Promise<TransactionReceipt> {

    trade.path[1] = this.WETH.address;

    await this.provideAllowance(trade.path[0], new BigNumber(trade.amountIn), options.onApprove);

    return this.web3Api.executeContractMethod(
        UniSwapContractAddress,
        UniSwapContractAbi,
        'swapExactTokensForETH',
        [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
        {
          onTransactionHash: options.onConfirm
        }
    );
  }

  private async createTokensToTokensTrade(
      trade: UniSwapTrade,
      options: {
        onConfirm?: (hash: string) => void,
        onApprove?: (hash: string) => void
      } = { }
  ): Promise<TransactionReceipt> {

    await this.provideAllowance(trade.path[0], new BigNumber(trade.amountIn), options.onApprove);

    return this.web3Api.executeContractMethod(
        UniSwapContractAddress,
        UniSwapContractAbi,
        'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
        { onTransactionHash: options.onConfirm }
    );
  }

  private async provideAllowance(tokenAddress: string, value: BigNumber, onApprove?: (hash: string) => void): Promise<void> {
    const allowance = await this.web3Api.getAllowance(tokenAddress, UniSwapContractAddress);
    if (value.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3Api.approveTokens(tokenAddress, UniSwapContractAddress, uintInfinity, { onTransactionHash: onApprove });
    }
  }

  private async getUniSwapTrade(fromAmount: BigNumber, fromToken: InstantTradeToken, toToken: InstantTradeToken, chainId?): Promise<Trade> {
    const uniSwapFromToken = new Token(chainId || ChainId.MAINNET, fromToken.address, fromToken.decimals);
    const uniSwapToToken = new Token(chainId || ChainId.MAINNET, toToken.address, toToken.decimals);
    const pair = await Fetcher.fetchPairData(uniSwapFromToken, uniSwapToToken, this.provider);
    const route = new Route([pair], uniSwapFromToken);

    const fullFromAmount = fromAmount.multipliedBy(10 ** fromToken.decimals);

    return  new Trade(route, new TokenAmount(uniSwapFromToken, fullFromAmount.toString()), TradeType.EXACT_INPUT);
  }
}
