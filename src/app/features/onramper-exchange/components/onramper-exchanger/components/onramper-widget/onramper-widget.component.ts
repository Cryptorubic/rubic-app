import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { WidgetConfig } from '@features/onramper-exchange/components/onramper-exchanger/components/onramper-widget/models/widget-config';
import { ThemeService } from '@core/services/theme/theme.service';
import { defaultWidgetConfig } from '@features/onramper-exchange/components/onramper-exchanger/components/onramper-widget/constants/default-widget-config';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { cryptoCode } from '@features/onramper-exchange/components/onramper-exchanger/components/onramper-widget/constants/crypto-code';
import { AuthService } from '@core/services/auth/auth.service';

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
    private readonly exchangerFormService: ExchangerFormService,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.setWidgetConfig();

    this.themeService.theme$.subscribe(() => {
      this.setWidgetConfig();
    });
  }

  private setWidgetConfig(): void {
    const darkMode = this.themeService.theme === 'dark';

    const defaultFiat = this.exchangerFormService.fromFiat.name;
    const defaultCrypto =
      cryptoCode[this.exchangerFormService.toToken.blockchain as keyof typeof cryptoCode];
    const onlyCryptos = defaultCrypto;
    const defaultAmount = this.exchangerFormService.fromAmount.toFixed();

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
}
