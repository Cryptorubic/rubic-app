import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OnramperWidgetConfig } from '@features/swaps/features/onramper-exchange/services/onramper-widget-service/models/onramper-widget-config';
import { ThemeService } from '@core/services/theme/theme.service';
import { map } from 'rxjs/operators';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { cryptoCode } from '@features/swaps/features/onramper-exchange/constants/crypto-code';
import { defaultOnramperWidgetConfig } from '@features/swaps/features/onramper-exchange/services/onramper-widget-service/constants/default-onramper-widget-config';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable()
export class OnramperWidgetService {
  constructor(
    private readonly themeService: ThemeService,
    private readonly swapFormService: SwapFormService,
    private readonly authService: AuthService
  ) {}

  /**
   * Returns widget url observable, based on current values in input form.
   */
  public getWidgetUrl(): Observable<string> {
    return this.themeService.theme$.pipe(
      map(theme => {
        const darkMode = theme === 'dark';

        const defaultFiat = (this.swapFormService.inputValue.fromAsset as FiatAsset).symbol;
        const defaultCrypto =
          cryptoCode[this.swapFormService.inputValue.toBlockchain as keyof typeof cryptoCode];
        const onlyCryptos = defaultCrypto;
        const defaultAmount = this.swapFormService.inputValue.fromAmount.toFixed();

        const walletAddress = this.authService.userAddress;
        const wallets = `${defaultCrypto}:${walletAddress}`;

        return this.parseToWidgetUrl({
          ...defaultOnramperWidgetConfig,
          darkMode,
          defaultFiat,
          defaultCrypto,
          onlyCryptos,
          defaultAmount,
          wallets,
          partnerContext: {
            walletAddress
          }
        });
      })
    );
  }

  private parseToWidgetUrl(widgetConfig: OnramperWidgetConfig): string {
    const queryParams = Object.entries(widgetConfig).reduce((acc, [key, value]) => {
      const encodedValue =
        key !== 'partnerContext' ? value : encodeURIComponent(JSON.stringify(value));
      return `${acc}${acc ? '&' : ''}${key}=${encodedValue}`;
    }, '');
    return `https://widget.onramper.com${queryParams ? '/?' : ''}${queryParams}`;
  }
}
