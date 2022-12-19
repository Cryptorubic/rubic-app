import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import {
  OnramperTradeApi,
  OnramperTradeApiResponse
} from '@core/services/backend/onramper-api/models/onramper-trade-api';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OnramperApiService {
  constructor(private readonly httpService: HttpService) {}

  public getTradeData(walletAddress: string, txId: string): Promise<OnramperTradeApi> {
    return firstValueFrom(
      this.httpService
        .get<OnramperTradeApiResponse>('onramp/transactions', {
          walletAddress,
          txId
        })
        .pipe(map(response => response.results[0]))
    );
  }
}
