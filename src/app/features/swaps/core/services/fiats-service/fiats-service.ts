import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FiatAsset } from '@features/swaps/shared/models/fiats/fiat-asset';
import { HttpClient } from '@angular/common/http';
import { onramperApiKey } from '@features/swaps/shared/constants/onramper/onramper-api-key';
import { OnramperGatewaysResponse } from '@features/swaps/core/services/fiats-service/models/onramper-gateways-response';
import { fiatsDictionary } from '@features/swaps/core/services/fiats-service/models/fiats-dictionary';

@Injectable()
export class FiatsService {
  private readonly _fiats$ = new BehaviorSubject<FiatAsset[]>(undefined);

  public readonly fiats$ = this._fiats$.asObservable();

  public get fiats(): FiatAsset[] {
    return this._fiats$.value;
  }

  private set fiats(value: FiatAsset[]) {
    this._fiats$.next(value);
  }

  constructor(private readonly httpClient: HttpClient) {
    this.setupFiats();
  }

  private setupFiats(): void {
    this.httpClient
      .get<OnramperGatewaysResponse>('https://onramper.tech/gateways', {
        headers: {
          Authorization: `Basic ${onramperApiKey}`
        }
      })
      .subscribe(response => {
        const responseFiatsCodes = response.gateways
          .map(gateway => gateway.fiatCurrencies.map(fiatCurrency => fiatCurrency.code))
          .flat();
        const localFiat = response.localization.currency;
        const fiatsCodes = [...new Set([localFiat, 'USD', 'EUR', ...responseFiatsCodes])];

        this.fiats = fiatsCodes.map(code => {
          const dictionaryImageName = fiatsDictionary[code];
          if (!dictionaryImageName) {
            return;
          }
          const image =
            'assets/images/icons/fiats/' +
            dictionaryImageName
              .slice(0, dictionaryImageName.length - 4)
              .match(/[A-Z][a-z]+/g)
              .join(' ')
              .toLowerCase() +
            '.svg';

          return {
            symbol: code,
            image
          };
        });
      });
  }
}
