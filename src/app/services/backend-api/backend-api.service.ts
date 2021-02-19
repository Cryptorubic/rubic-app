import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITableTransaction } from '../bridge/types';
import { environment } from '../../../environments/environment';
import { HttpService } from '../http/http.service';
import { BridgeTransaction } from '../bridge/BridgeTransaction';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  constructor(private httpService: HttpService, private httpClient: HttpClient) {}

  public getTransactions(walletAddress: string): Promise<ITableTransaction[]> {
    return new Promise<ITableTransaction[]>((resolve, reject) => {
      this.httpService.get('bridge/transactions', { walletAddress, t: Date.now() }).subscribe(
        (response: ITableTransaction[]) => {
          resolve(response);
        },
        error => {
          console.log(error);
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
          console.log(error);
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
          console.log(error);
          reject(error);
        }
      );
    });
  }

  public notifyInstantTradesBot(
    walletAddress: string,
    amountFrom: number,
    amountTo: number,
    symbolFrom: string,
    symbolTo: string,
    txHash: string
  ): Promise<void> {
    const body = {
      walletAddress,
      amountFrom,
      amountTo,
      symbolFrom,
      symbolTo,
      txHash
    };

    return new Promise<void>((resolve, reject) => {
      this.httpClient.post(environment.instantTradesBotUrl, body).subscribe(
        () => {
          resolve();
        },
        error => {
          console.log(error);
          reject(error);
        }
      );
    });
  }
}
