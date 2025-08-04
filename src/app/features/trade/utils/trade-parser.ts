import {
  BlockchainName,
  OnChainTrade,
  OnChainTradeType,
  CrossChainTradeType,
  CrossChainTrade
} from '@cryptorubic/sdk';
import BigNumber from 'bignumber.js';

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

  public static getItSwapParams(trade: OnChainTrade): {
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
}
