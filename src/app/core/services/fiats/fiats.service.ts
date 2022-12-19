import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { HttpClient } from '@angular/common/http';
import { onramperApiKey } from '@app/shared/constants/onramper/onramper-api-key';
import { OnramperGatewaysResponse } from '@core/services/fiats/models/onramper-gateways-response';
import { fiatsDictionary } from '@core/services/fiats/constants/fiats-dictionary';
import { catchError, timeout } from 'rxjs/operators';

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
        },
        params: {
          includeIcons: true
        }
      })
      .pipe(
        timeout(3000),
        catchError(() =>
          of({
            gateways: [],
            localization: { currency: null },
            icons: {}
          } as OnramperGatewaysResponse)
        )
      )
      .subscribe(response => {
        const responseFiatsCodes = response.gateways
          .map(gateway => gateway.fiatCurrencies.map(fiatCurrency => fiatCurrency.code))
          .flat();
        const localFiat = response.localization.currency;
        const fiatsCodes = [
          ...new Set([...(localFiat ? [localFiat] : []), 'USD', 'EUR', ...responseFiatsCodes])
        ];

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
            image,
            name: response.icons[code]?.name
          };
        });
      });
  }
}
