import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import {
  OnrampTradeApi,
  OnrampTradeApiResponse
} from '@core/services/backend/onramper-api/models/onramp-api';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OnramperApiService {
  constructor(private readonly httpService: HttpService) {}

  public getTradeData(walletAddress: string, txId: string): Promise<OnrampTradeApi> {
    return firstValueFrom(
      this.httpService
        .get<OnrampTradeApiResponse>('onramp/transactions', {
          walletAddress,
          txId
        })
        .pipe(map(response => response.results[0]))
    );
  }
}
