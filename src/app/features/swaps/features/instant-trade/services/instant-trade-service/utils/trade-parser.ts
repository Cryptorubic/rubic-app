import {
  BlockchainName,
  OnChainTrade,
  ON_CHAIN_TRADE_TYPE,
  OnChainTradeType,
  CrossChainTradeType
} from 'rubic-sdk';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';
import BigNumber from 'bignumber.js';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

export class TradeParser {
  public static getCrossChainSwapParams(trade: CrossChainTrade): {
    fromAddress: string;
    fromSymbol: string;
    fromAmount: BigNumber;
    fromPrice: number;
    fromDecimals: number;
    toAddress: string;
    toSymbol: string;
    toAmount: BigNumber;
    toPrice: number;
    toDecimals: number;
    fromBlockchain: BlockchainName;
    toBlockchain: BlockchainName;
    type: CrossChainTradeType;
  } {
    return {
      fromAddress: trade.from.address,
      fromSymbol: trade.from.symbol,
      fromAmount: trade.from.tokenAmount,
      fromPrice: trade.from.price.toNumber(),
      fromDecimals: trade.from.decimals,
      toAddress: trade.to.address,
      toSymbol: trade.to.symbol,
      toAmount: trade.to.tokenAmount,
      toPrice: trade.to.price.toNumber(),
      toDecimals: trade.to.decimals,
      fromBlockchain: trade.from.blockchain,
      toBlockchain: trade.to.blockchain,
      type: trade.type
    };
  }

  public static getItSwapParams(trade: OnChainTrade | WrapTrade): {
    fromAddress: string;
    fromSymbol: string;
    fromAmount: BigNumber;
    fromPrice: number;
    fromDecimals: number;
    toAddress: string;
    toSymbol: string;
    toAmount: BigNumber;
    toPrice: number;
    toDecimals: number;
    blockchain: BlockchainName;
    type: OnChainTradeType;
  } {
    if (trade instanceof OnChainTrade) {
      return {
        fromAddress: trade.from.address,
        fromSymbol: trade.from.symbol,
        fromAmount: trade.from.tokenAmount,
        fromPrice: trade.from.price.toNumber(),
        fromDecimals: trade.from.decimals,
        toAddress: trade.to.address,
        toSymbol: trade.to.symbol,
        toAmount: trade.to.tokenAmount,
        toPrice: trade.to.price.toNumber(),
        toDecimals: trade.to.decimals,
        blockchain: trade.from.blockchain,
        type: trade.type
      };
    }
    return {
      fromAddress: trade.from.token.address,
      fromSymbol: trade.from.token.symbol,
      fromAmount: trade.from.amount,
      fromPrice: trade.from.token.price,
      fromDecimals: trade.from.token.decimals,
      toAddress: trade.to.token.address,
      toSymbol: trade.to.token.symbol,
      toAmount: trade.to.amount,
      toPrice: trade.to.token.price,
      toDecimals: trade.to.token.decimals,
      blockchain: trade.blockchain,
      type: ON_CHAIN_TRADE_TYPE.WRAPPED
    };
  }
}
