import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ITableTransaction} from '../bridge/types';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private apiUrl: string = 'https://rubic.exchange/api/v1/'

  constructor(private httpClient: HttpClient) { }

  public getTransactions(address: string): Promise<ITableTransaction[]> {
    return new Promise<ITableTransaction[]>((resolve, reject) => {
      /*this.httpClient.get(this.apiUrl + 'bridge/transactions?address=' + address).subscribe((response: ITableTransaction[]) => {
        resolve(response);
      },
       error => {
        console.log(error);
        reject(error);
       })*/
      const txArray: ITableTransaction[] = [
        {
          binanceId: "123456789",
          fromNetwork: 'ETH',
          toNetwork: 'BSC',
          actualFromAmount: 0.13,
          actualToAmount: 0.10,
          img: 'https://devswaps.mywish.io/media/token_images/1027_majtWZq.png',
          ethSymbol: 'ETH',
          bscSymbol: 'ETH',
          creationTime: '05-05-2020 18:43',
          status: 'Completed'
        },
        {
          binanceId: "12345678",
          fromNetwork: 'BSC',
          toNetwork: 'ETH',
          actualFromAmount: 50,
          actualToAmount: 48,
          img: 'https://devswaps.mywish.io/media/token_images/825_HAqppL0.png',
          ethSymbol: 'USDT',
          bscSymbol: 'BUSD-T',
          creationTime: '05-05-2020 13:43',
          status: 'Completed'
        },
        {
          binanceId: "1234567",
          fromNetwork: 'ETH',
          toNetwork: 'BSC',
          actualFromAmount: 0.135,
          actualToAmount: 0.8,
          img: 'https://devswaps.mywish.io/media/token_images/1831_vGZSuqA.png',
          ethSymbol: 'BBCH',
          bscSymbol: 'BCH',
          creationTime: '05-02-2020 18:43',
          status: 'Rejected'
        },
        {
          binanceId: "123456",
          fromNetwork: 'BSC',
          toNetwork: 'ETH',
          actualFromAmount: 30,
          actualToAmount: 29,
          img: 'https://devswaps.mywish.io/media/token_images/4943.png',
          ethSymbol: 'DAI',
          bscSymbol: 'DAI',
          creationTime: '06-05-2020 18:43',
          status: 'Progress'
        }
      ]
      setTimeout(() => resolve(txArray), 2000)
    })
  }

  public postTransaction(binanceTransactionId: string, ethSymbol: string, bscSymbol: string): Promise<void> {
    const body = {
      binanceTransactionId,
      ethSymbol,
      bscSymbol
    }

    return new Promise<void>((resolve, reject) => {
      /*this.httpClient.post(this.apiUrl + 'bridge/transactions', body).subscribe(() => {
            resolve();
          },
          error => {
            console.log(error);
            reject(error);
          })*/
      setTimeout(() => resolve(), 500);
    })
  }
}
