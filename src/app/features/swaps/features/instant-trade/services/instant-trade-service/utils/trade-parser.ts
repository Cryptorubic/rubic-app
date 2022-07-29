import { BlockchainName, InstantTrade, TRADE_TYPE, TradeType } from 'rubic-sdk';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';
import BigNumber from 'bignumber.js';

export class TradeParser {
  public static getItSwapParams(trade: InstantTrade | WrapTrade): {
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
    type: TradeType;
  } {
    if (trade instanceof InstantTrade) {
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
      type: TRADE_TYPE.WRAPPED
    };
  }
}
