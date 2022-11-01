import { Injectable } from '@angular/core';
import { BridgeTrade } from '@features/swaps/features/bridge/models/bridge-trade';
import { BridgeTokenPair } from '@features/swaps/features/bridge/models/bridge-token-pair';
import { EMPTY, Observable } from 'rxjs';
import { first, map, mergeMap, switchMap } from 'rxjs/operators';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { HttpService } from '../../http/http.service';
import { BOT_URL } from 'src/app/core/services/backend/constants/bot-url';
import { BridgeBotRequest } from '@core/services/backend/bridge-api/models/bridge-bot-request';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';

@Injectable({
  providedIn: 'root'
})
export class BridgeApiService {
  constructor(private httpService: HttpService, private tokensService: TokensService) {}

  /**
   * Makes POST request to add transaction to database.
   * @param fromBlockchain From blockchain name.
   * @param transactionHash Hash of transaction.
   * @param actualFromAmount Amount of tokens sent.
   * @param walletFromAddress User's wallet address.
   */
  public postRubicTransaction(
    fromBlockchain: BlockchainName,
    transactionHash: string,
    actualFromAmount: string,
    walletFromAddress: string
  ): Promise<void> {
    const body = {
      type: 'swap_rbc',
      fromNetwork: fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ? 1 : 2,
      transaction_id: transactionHash,
      actualFromAmount,
      walletFromAddress
    };

    return this.httpService.post<void>('bridges/transactions', body).toPromise();
  }

  /**
   * Makes POST request to add transaction to database.
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
      .patch<void>(
        'bridges/transactions',
        {
          type: 'polygon',
          to_transaction_hash: newTransactionHash,
          status
        },
        {
          transaction_id: burnTransactionHash
        }
      )
      .toPromise();
  }

  /**
   * Makes POST request to add transaction to database.
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
   * Gets token price.
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
