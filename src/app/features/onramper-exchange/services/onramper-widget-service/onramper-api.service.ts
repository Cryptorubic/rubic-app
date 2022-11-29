import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { onramperApiKey } from '@features/onramper-exchange/constants/onramper-api-key';
import { OnramperRateResponse } from '@features/onramper-exchange/services/onramper-widget-service/models/onramper-rate-response';
import { firstValueFrom } from 'rxjs';
import BigNumber from 'bignumber.js';

@Injectable({
  providedIn: 'root'
})
export class OnramperApiService {
  constructor(private readonly httpClient: HttpClient) {}

  public async getOutputNativeTokenAmount(): Promise<BigNumber> {
    const trades = await firstValueFrom(
      this.httpClient.get<OnramperRateResponse>(
        'https://onramper.tech/rate/USD/ETH/creditCard/100',
        {
          headers: { Authorization: `Basic ${onramperApiKey}` }
        }
      )
    );
    const bestTrade = trades
      .filter(trade => trade.available)
      .sort((a, b) => {
        if (a.receivedCrypto === b.receivedCrypto) {
          return 0;
        }
        return a.receivedCrypto > b.receivedCrypto ? -1 : 1;
      })[0];
    if (!bestTrade?.receivedCrypto) {
      return new BigNumber(NaN);
    }
    return new BigNumber(bestTrade.receivedCrypto);
  }
}
