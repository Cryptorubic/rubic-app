import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CurrencyConverterService } from './services/currency-converter.service';

@Component({
  selector: 'app-currency-conventer-button',
  templateUrl: './currency-conventer-button.component.html',
  styleUrls: ['./currency-conventer-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyConventerButtonComponent {
  public isDollarMode$ = this.currencyModeService.isDollarMode$;

  public isDisabled$ = this.currencyModeService.isDollarModeDisabled$;

  constructor(private readonly currencyModeService: CurrencyConverterService) {}

  public switchCurrencyMode(isDollarMode: boolean): void {
    this.currencyModeService.switchCurrencyMode(isDollarMode);
  }
}
