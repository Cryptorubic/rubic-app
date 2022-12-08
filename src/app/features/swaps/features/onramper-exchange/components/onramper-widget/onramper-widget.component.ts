import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { ThemeService } from '@core/services/theme/theme.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WidgetConfig } from '@features/swaps/features/onramper-exchange/components/onramper-widget/models/widget-config';
import { cryptoCode } from '@features/swaps/features/onramper-exchange/constants/crypto-code';
import { defaultWidgetConfig } from '@features/swaps/features/onramper-exchange/components/onramper-widget/constants/default-widget-config';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { FiatAsset } from '@features/swaps/shared/models/fiats/fiat-asset';
import { OnramperBottomFormService } from '@features/swaps/features/onramper-exchange/services/onramper-bottom-form-service/onramper-bottom-form-service';

@Component({
  selector: 'app-onramper-widget',
  templateUrl: './onramper-widget.component.html',
  styleUrls: ['./onramper-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperWidgetComponent implements OnInit {
  @ViewChild('onramperWidget') public onramperWidget: ElementRef;

  private widgetConfig: WidgetConfig;

  public get widgetUrl(): string {
    const queryParams = Object.entries(this.widgetConfig).reduce((acc, [key, value]) => {
      const encodedValue =
        key !== 'partnerContext' ? value : encodeURIComponent(JSON.stringify(value));
      return `${acc}${acc ? '&' : ''}${key}=${encodedValue}`;
    }, '');
    return `https://widget.onramper.com${queryParams ? '/?' : ''}${queryParams}`;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService,
    private readonly swapFormService: SwapFormService,
    private readonly authService: AuthService,
    private readonly onramperBottomFormService: OnramperBottomFormService
  ) {}

  ngOnInit() {
    this.setWidgetConfig();

    this.themeService.theme$.subscribe(() => {
      this.setWidgetConfig();
    });
  }

  private setWidgetConfig(): void {
    const darkMode = this.themeService.theme === 'dark';

    const defaultFiat = (this.swapFormService.inputValue.fromAsset as FiatAsset).symbol;
    const defaultCrypto =
      cryptoCode[this.swapFormService.inputValue.toBlockchain as keyof typeof cryptoCode];
    const onlyCryptos = defaultCrypto;
    const defaultAmount = this.swapFormService.inputValue.fromAmount.toFixed();

    const walletAddress = this.authService.userAddress;
    const wallets = `${defaultCrypto}:${walletAddress}`;

    this.widgetConfig = {
      ...defaultWidgetConfig,
      darkMode,
      defaultFiat,
      defaultCrypto,
      onlyCryptos,
      defaultAmount,
      wallets,
      partnerContext: {
        walletAddress
      }
    };

    this.cdr.detectChanges();
  }

  public closeWidget(): void {
    this.onramperBottomFormService.widgetOpened = false;
  }
}
