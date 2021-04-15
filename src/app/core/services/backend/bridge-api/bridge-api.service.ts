import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import { HttpService } from '../../http/http.service';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeTrade } from '../../../../features/bridge-page/models/BridgeTrade';
import { BridgeTableTradeApi } from '../../../../features/bridge-page/models/BridgeTableTrade';

@Injectable({
  providedIn: 'root'
})
export class BridgeApiService {
  constructor(private httpService: HttpService, private httpClient: HttpClient) {}

  public getTransactions(walletAddress: string): Promise<BridgeTableTradeApi[]> {
    return new Promise<BridgeTableTradeApi[]>((resolve, reject) => {
      this.httpService.get('bridge/transactions', { walletAddress, t: Date.now() }).subscribe(
        (response: BridgeTableTradeApi[]) => {
          resolve(response);
        },
        error => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

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

    return new Promise<void>((resolve, reject) => {
      this.httpService.post('bridge/transactions', body).subscribe(
        () => {
          resolve();
        },
        error => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

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

    return new Promise<void>((resolve, reject) => {
      this.httpService.post('bridge/transactions', body).subscribe(
        () => {
          resolve();
        },
        error => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  public postPolygonTransaction(
    bridgeTrade: BridgeTrade,
    status: string,
    transactionHash: string,
    userAddress: string
  ): Promise<void> {
    const body = {
      type: 'polygon',
      fromNetwork: bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.POLYGON ? 'POL' : 'ETH',
      toNetwork: bridgeTrade.toBlockchain === BLOCKCHAIN_NAME.POLYGON ? 'POL' : 'ETH',
      actualFromAmount: bridgeTrade.amount,
      actualToAmount: bridgeTrade.amount,
      ethSymbol: bridgeTrade.token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].address,
      bscSymbol: bridgeTrade.token.blockchainToken[BLOCKCHAIN_NAME.POLYGON].address,
      updateTime: new Date(),
      status,
      transaction_id: transactionHash,
      walletFromAddress: userAddress,
      walletToAddress: userAddress,
      walletDepositAddress: '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74'
    };

    return new Promise<void>((resolve, reject) => {
      this.httpService.post('bridge/transactions', body).subscribe(
        () => {
          resolve();
        },
        error => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  public patchPolygonTransaction(transactionHash: string, status: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.httpService.patch(`bridge/transactions/${transactionHash}`, { status }).subscribe(
        () => {
          resolve();
        },
        error => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  public notifyBridgeBot(
    bridgeTrade: BridgeTrade,
    binanceId: string,
    walletAddress: string
  ): Promise<void> {
    const body = {
      binanceId,
      walletAddress,
      amount: bridgeTrade.amount,
      network: bridgeTrade.fromBlockchain,
      symbol: bridgeTrade.token.symbol,
      ethSymbol: bridgeTrade.token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].symbol
    };

    return new Promise<void>((resolve, reject) => {
      this.httpClient.post(environment.bridgeBotUrl, body).subscribe(
        () => {
          resolve();
        },
        error => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
}
