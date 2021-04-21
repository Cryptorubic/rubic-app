import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import { HttpService } from '../../http/http.service';
import { BridgeTransaction } from '../../../../features/bridge-page/services/BridgeTransaction';
import { BridgeTableTransaction } from '../../../../features/bridge-page/models/BridgeTableTransaction';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

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

  public postTransaction(
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
    fromNetwork: BLOCKCHAIN_NAME,
    txHash: string,
    fromAmount: string,
    walletFromAddress: string
  ) {
    const body = {
      type: 'swap_rbc',
      fromNetwork: fromNetwork === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ? 1 : 2,
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

  public notifyBridgeBot(tx: BridgeTransaction, walletAddress: string): Promise<void> {
    const body = {
      binanceId: tx.binanceId,
      walletAddress,
      amount: tx.amount,
      network: tx.network,
      symbol: tx.token.symbol,
      ethSymbol: tx.token.ethSymbol
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
