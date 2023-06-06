import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from '@core/services/theme/theme.service';
import { map } from 'rxjs/operators';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { AuthService } from '@core/services/auth/auth.service';
import { defaultOnramperWidgetConfig } from '@features/swaps/features/onramper-exchange/constants/default-onramper-widget-config';
import { OnramperWidgetConfig } from '@features/swaps/features/onramper-exchange/models/onramper-widget-config';
import { OnramperFormCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-form-calculation.service';
import { EvmWeb3Pure } from 'rubic-sdk';

@Injectable()
export class OnramperWidgetService {
  constructor(
    private readonly themeService: ThemeService,
    private readonly swapFormService: SwapFormService,
    private readonly authService: AuthService,
    private readonly onramperFormCalculationService: OnramperFormCalculationService
  ) {}

  /**
   * Returns widget url observable, based on current values in input form.
   */
  public getWidgetUrl(): Observable<string> {
    return this.themeService.theme$.pipe(
      map(currentTheme => {
        const darkMode = currentTheme === 'dark';

        const defaultFiat = (this.swapFormService.inputValue.fromAsset as FiatAsset).symbol;
        const defaultCrypto = this.onramperFormCalculationService.buyingTokenCode;

        const onlyCryptos = defaultCrypto;
        const defaultAmount = this.swapFormService.inputValue.fromAmount.toFixed();

        const walletAddress = this.authService.userAddress;
        const wallets = `${defaultCrypto}:${walletAddress}`;

        const isDirect = this.onramperFormCalculationService.isDirectSwap;

        return this.parseToWidgetUrl({
          ...defaultOnramperWidgetConfig,
          themeName: darkMode ? 'dark' : 'light',
          defaultFiat,
          defaultCrypto,
          onlyCryptos,
          defaultAmount,
          wallets,
          partnerContext: {
            isDirect,
            id: EvmWeb3Pure.randomHex(16)
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
    return `https://buy.onramper.com${queryParams ? '/?' : ''}${queryParams}`;
  }
}
