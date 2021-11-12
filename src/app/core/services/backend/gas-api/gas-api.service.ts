import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { HttpService } from 'src/app/core/services/http/http.service';
import { Observable, of } from 'rxjs';
import { Cacheable } from 'ts-cacheable';
import {
  TO_BACKEND_BLOCKCHAINS,
  ToBackendBlockchain
} from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { catchError, map } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { FROM_TEST_BLOCKCHAINS } from '@shared/constants/blockchain/TEST_BLOCKCHAINS';

@Injectable({
  providedIn: 'root'
})
export class GasApiService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Gets minimum gas price for blockchain to use it in transactions.
   * @param blockchain Blockchain to get minimum gas price for.
   * @return Observable<BigNumber> Minimum gas price in Wei.
   */
  @Cacheable({
    maxAge: 15_000
  })
  public getMinGasPriceInBlockchain(blockchain: BLOCKCHAIN_NAME): Observable<BigNumber> {
    const backendBlockchain =
      TO_BACKEND_BLOCKCHAINS[FROM_TEST_BLOCKCHAINS[blockchain] as ToBackendBlockchain];
    return this.httpService
      .get<{
        [backendBlockchain: string]: number;
      }>('min_gas_price', { blockchain: backendBlockchain })
      .pipe(
        map(minGasPrice => {
          return new BigNumber(minGasPrice[backendBlockchain]).multipliedBy(10 ** 9);
        }),
        catchError(() => {
          return of(null);
        })
      );
  }
}
