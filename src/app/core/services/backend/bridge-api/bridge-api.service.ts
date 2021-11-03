import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { EMPTY, Observable } from 'rxjs';
import { first, map, mergeMap, switchMap, timeout } from 'rxjs/operators';
import { TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import {
  BridgeBlockchainApi,
  BridgeTableTradeApi
} from 'src/app/core/services/backend/bridge-api/models/BridgeTableTradeApi';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { BridgeBotRequest } from 'src/app/core/services/backend/bridge-api/models/BridgeBotRequest';
import { HttpService } from '../../http/http.service';
import { BOT_URL } from '../constants/BOT_URL';

@Injectable({
  providedIn: 'root'
})
export class BridgeApiService {
  private readonly tradeBlockchain: Record<BridgeBlockchainApi, BLOCKCHAIN_NAME> = {
    ETH: BLOCKCHAIN_NAME.ETHEREUM,
    BSC: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    POL: BLOCKCHAIN_NAME.POLYGON,
    TRX: BLOCKCHAIN_NAME.TRON,
    XDAI: BLOCKCHAIN_NAME.XDAI
  };

  constructor(private httpService: HttpService, private tokensService: TokensService) {}

  /**
   * Gets user's bridges transactions.
   * @param walletAddress User's wallet address.
   * @return Observable Trade object.
   */
  public getUserTrades(walletAddress: string): Observable<TableTrade[]> {
    return this.httpService
      .get('bridges/transactions', { walletAddress: walletAddress.toLowerCase(), t: Date.now() })
      .pipe(
        timeout(3000),
        map((tradesApi: BridgeTableTradeApi[]) =>
          tradesApi.map(trade => this.parseTradeApiToTableTrade(trade))
        )
      );
  }

  /**
   * Parses bridge trade api response.
   * @param trade Trade from bridge api response.
   * @return TableTrade Parsed trade object.
   */
  private parseTradeApiToTableTrade(trade: BridgeTableTradeApi): TableTrade {
    const fromBlockchain = this.tradeBlockchain[trade.fromNetwork];
    const toBlockchain = this.tradeBlockchain[trade.toNetwork];

    let status = trade.status.toLowerCase() as TRANSACTION_STATUS;
    if (
      fromBlockchain === BLOCKCHAIN_NAME.POLYGON &&
      status === TRANSACTION_STATUS.WAITING_FOR_DEPOSIT
    ) {
      status = TRANSACTION_STATUS.WAITING_FOR_RECEIVING;
    }

    return {
      transactionHash: trade.fromTransactionHash,
      transactionId: trade.transaction_id,
      status,
      provider: trade.type,
      fromToken: {
        blockchain: fromBlockchain,
        symbol: trade.ethSymbol,
        amount: new BigNumber(trade.actualFromAmount).toFixed(),
        image: trade.image_link
      },
      toToken: {
        blockchain: toBlockchain,
        symbol: trade.bscSymbol,
        amount: new BigNumber(trade.actualToAmount).toFixed(),
        image: trade.image_link
      },
      date: new Date(trade.updateTime)
    };
  }

  /**
   * Makes POST request for add transaction to database.
   * @param binanceTransactionId ID of transaction in BSC.
   * @param ethSymbol From token symbol.
   * @param bscSymbol To token symbol.
   */
  public postPanamaTransaction(
    binanceTransactionId: string,
    ethSymbol: string,
    bscSymbol: string
  ): Promise<void> {
    const body = {
      type: 'panama',
      transaction_id: binanceTransactionId,
      ethSymbol,
      bscSymbol
    };

    return this.httpService.post<void>('bridges/transactions', body).toPromise();
  }

  /**
   * Makes POST request for add transaction to database.
   * @param fromBlockchain From blockchain name.
   * @param transactionHash Hash of transaction.
   * @param fromAmount Amount of tokens sent.
   * @param walletFromAddress User's wallet address.
   */
  public postRubicTransaction(
    fromBlockchain: BLOCKCHAIN_NAME,
    transactionHash: string,
    fromAmount: string,
    walletFromAddress: string
  ): Promise<void> {
    const body = {
      type: 'swap_rbc',
      fromNetwork: fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ? 1 : 2,
      transaction_id: transactionHash,
      fromAmount,
      walletFromAddress
    };

    return this.httpService.post<void>('bridges/transactions', body).toPromise();
  }

  /**
   * Makes POST request for add transaction to database.
   * @param bridgeTrade Trade data object.
   * @param status Trade transaction status.
   * @param transactionHash Hash of transaction.
   * @param userAddress User's wallet address.
   */
  public postPolygonTransaction(
    bridgeTrade: BridgeTrade,
    status: TRANSACTION_STATUS,
    transactionHash: string,
    userAddress: string
  ): Promise<void> {
    const body = {
      type: 'polygon',
      fromNetwork: bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.POLYGON ? 'POL' : 'ETH',
      toNetwork: bridgeTrade.toBlockchain === BLOCKCHAIN_NAME.POLYGON ? 'POL' : 'ETH',
      actualFromAmount: bridgeTrade.amount,
      actualToAmount: bridgeTrade.amount,
      ethSymbol: bridgeTrade.token.tokenByBlockchain[bridgeTrade.fromBlockchain].address,
      bscSymbol: bridgeTrade.token.tokenByBlockchain[bridgeTrade.toBlockchain].address,
      updateTime: new Date(),
      status: status.toLowerCase(),
      transaction_id: transactionHash,
      walletFromAddress: userAddress,
      walletToAddress: userAddress,
      walletDepositAddress: '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74'
    };

    return this.httpService.post<void>('bridges/transactions', body).toPromise();
  }

  /**
   * Makes PATCH request for update polygon bridge transaction in database.
   * @param burnTransactionHash Transaction hash for burn.
   * @param newTransactionHash New Transaction hash.
   * @param status Trade transaction status.
   */
  public patchPolygonTransaction(
    burnTransactionHash: string,
    newTransactionHash: string,
    status: TRANSACTION_STATUS
  ): Promise<void> {
    return this.httpService
      .patch(
        'bridges/transactions',
        {
          type: 'polygon',
          second_transaction_id: newTransactionHash,
          status
        },
        {
          transaction_id: burnTransactionHash
        }
      )
      .toPromise() as Promise<void>;
  }

  /**
   * Makes POST request for add transaction to database.
   * @param transactionHash Transaction hash.
   */
  public postXDaiTransaction(transactionHash: string): Promise<void> {
    const body = {
      type: 'xdai',
      fromNetwork: BLOCKCHAIN_NAME.ETHEREUM.toLowerCase(),
      transaction_id: transactionHash
    };

    return this.httpService.post<void>('bridges/transactions', body).toPromise();
  }

  /**
   * Makes POST request for add transaction to database.
   * @param transactionHash Transaction hash.
   * @param fromBlockchain From blockchain name.
   */
  public postEvoTransaction(
    transactionHash: string,
    fromBlockchain: BLOCKCHAIN_NAME
  ): Promise<void> {
    const body = {
      type: 'evodefi',
      fromNetwork:
        fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ? 'binance-smart-chain' : 'polygon',
      transaction_id: transactionHash
    };

    return this.httpService.post('bridges/transactions', body).toPromise() as Promise<void>;
  }

  /**
   * Makes POST request for notify bridge bot.
   * @param bridgeTrade Trade data object.
   * @param transactionHash Hash of transaction.
   * @param walletAddress User's wallet address.
   */
  public notifyBridgeBot(
    bridgeTrade: BridgeTrade,
    transactionHash: string,
    walletAddress: string
  ): Promise<void> {
    return this.getTokenPrice(bridgeTrade.token)
      .pipe(
        mergeMap(price => {
          const body: BridgeBotRequest = {
            txHash: transactionHash,
            walletAddress,
            amount: bridgeTrade.amount.toNumber(),
            fromBlockchain: bridgeTrade.fromBlockchain,
            toBlockchain: bridgeTrade.toBlockchain,
            symbol: bridgeTrade.token.symbol,
            price
          };
          return this.httpService.post(BOT_URL.BRIDGES, body).pipe(switchMap(() => EMPTY));
        })
      )
      .toPromise();
  }

  /**
   * Gets tokens price.
   * @param bridgeTokenPair Object with info about pair of tokens.
   * @return number Token price.
   */
  private getTokenPrice(bridgeTokenPair: BridgeTokenPair): Observable<number> {
    return this.tokensService.tokens$.pipe(
      first(),
      map(backendTokens => {
        const prices = Object.values(BLOCKCHAIN_NAME)
          .map(
            blockchain =>
              backendTokens.find(
                token =>
                  bridgeTokenPair.tokenByBlockchain[blockchain]?.address.toLowerCase() ===
                  token.address.toLowerCase()
              )?.price
          )
          .filter(it => it)
          .sort((a, b) => b - a);
        return prices[0] || 0;
      })
    );
  }
}
