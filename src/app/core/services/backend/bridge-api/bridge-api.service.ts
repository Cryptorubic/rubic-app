import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import { HttpService } from '../../http/http.service';
import { BridgeTableTransaction } from '../../../../features/bridge-page/models/BridgeTableTransaction';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeTrade } from '../../../../features/bridge-page/models/BridgeTrade';

@Injectable({
  providedIn: 'root'
})
export class BridgeApiService {
  constructor(private httpService: HttpService, private httpClient: HttpClient) {}

  public getTransactions(walletAddress: string): Promise<BridgeTableTransaction[]> {
    return new Promise<BridgeTableTransaction[]>((resolve, reject) => {
      this.httpService.get('bridge/transactions', { walletAddress, t: Date.now() }).subscribe(
        (response: BridgeTableTransaction[]) => {
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
    txHash: string,
    fromAmount: string,
    walletFromAddress: string
  ) {
    const body = {
      type: 'swap_rbc',
      fromNetwork: fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ? 1 : 2,
      transaction_id: txHash,
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

  public postPolygonTransaction(bridgeTrade: BridgeTrade, txHash: string, userAddress: string) {
    const body = {
      type: 'polygon',
      fromNetwork: bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.POLYGON ? 'POL' : 'ETH',
      toNetwork: bridgeTrade.toBlockchain === BLOCKCHAIN_NAME.POLYGON ? 'POL' : 'ETH',
      actualFromAmount: bridgeTrade.amount,
      actualToAmount: bridgeTrade.amount,
      ethSymbol: bridgeTrade.token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].address,
      bscSymbol: bridgeTrade.token.blockchainToken[BLOCKCHAIN_NAME.POLYGON].address,
      updateTime: new Date(),
      status: 'DepositInProgress',
      transaction_id: txHash,
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
