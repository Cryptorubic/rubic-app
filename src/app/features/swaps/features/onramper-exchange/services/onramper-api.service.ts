import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OnramperSupportedResponse } from '@features/swaps/features/onramper-exchange/models/onramper-supported-response';
import { OnramperRateResponse } from '@features/swaps/features/onramper-exchange/models/onramper-rate-response';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ts-cacheable';

@Injectable()
export class OnramperApiService {
  public static readonly mainApi = 'https://api.onramper.com/';

  constructor(private readonly httpClient: HttpClient) {}

  @Cacheable({
    maxAge: 15_000
  })
  public fetchSupportedCrypto(): Observable<OnramperSupportedResponse> {
    const url = `${OnramperApiService.mainApi}supported`;
    return this.httpClient.get<OnramperSupportedResponse>(url);
  }

  public fetchRate(
    fromFiat: string,
    toCrypto: string,
    fromAmount: string
  ): Observable<OnramperRateResponse> {
    const url = `${OnramperApiService.mainApi}quotes/${fromFiat}/${toCrypto}?amount=${fromAmount}&paymentMethod=creditcard`;
    return this.httpClient.get<OnramperRateResponse>(url);
  }
}
