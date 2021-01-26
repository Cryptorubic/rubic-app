import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ITableTransaction} from '../bridge/types';
import {environment} from '../../../environments/environment';
import {HttpService} from '../http/http.service';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {

  constructor(private httpService: HttpService) { }

  public getTransactions(walletAddress: string): Promise<ITableTransaction[]> {
    return new Promise<ITableTransaction[]>((resolve, reject) => {
      this.httpService.get('bridge/transactions', { walletAddress, t: Date.now() }).subscribe((response: ITableTransaction[]) => {
        resolve(response);
      },
       error => {
        console.log(error);
        reject(error);
       })
    })
  }

  public postTransaction(binanceTransactionId: string, ethSymbol: string, bscSymbol: string): Promise<void> {
    const body = {
      transaction_id: binanceTransactionId,
      ethSymbol,
      bscSymbol
    }

    return new Promise<void>((resolve, reject) => {
      this.httpService.post( 'bridge/transactions', body).subscribe(() => {
            resolve();
          },
          error => {
            console.log(error);
            reject(error);
          })
    })
  }
}
