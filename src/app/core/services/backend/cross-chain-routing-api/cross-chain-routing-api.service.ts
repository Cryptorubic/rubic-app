import { Injectable } from '@angular/core';
import { TableToken, TableTrade } from '@shared/models/my-trades/table-trade';
import { FROM_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import {
  CrossChainTokenApi,
  CrossChainTradeApi
} from '@core/services/backend/cross-chain-routing-api/models/cross-chain-trades-response-api';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingApiService {
  constructor() {}

  static getTableToken(token: CrossChainTokenApi, amount: string): TableToken {
    return {
      blockchain:
        FROM_BACKEND_BLOCKCHAINS[token.network as keyof typeof FROM_BACKEND_BLOCKCHAINS] ||
        BLOCKCHAIN_NAME.ETHEREUM,
      symbol: token.symbol,
      amount,
      image: token.image,
      address: token.address
    };
  }

  static parseTradeApiToTableTrade(tradeApi: CrossChainTradeApi): TableTrade {
    const transactionHashScanUrl = tradeApi.toTransactionScanURL || tradeApi.fromTransactionScanURL;

    // change date format for safari
    const date = tradeApi.statusUpdatedAt.replace(/-/g, '/').slice(0, 19) + ' GMT+0000';
    return {
      fromTransactionHash: tradeApi.fromTransactionHash,
      toTransactionHash: tradeApi.toTransactionHash,
      transactionHashScanUrl,
      status: tradeApi.status,
      provider: 'CROSS_CHAIN_ROUTING_PROVIDER',
      fromToken: CrossChainRoutingApiService.getTableToken(tradeApi.fromToken, tradeApi.fromAmount),
      toToken: CrossChainRoutingApiService.getTableToken(tradeApi.toToken, tradeApi.toAmount),
      date: new Date(date)
    };
  }
}
