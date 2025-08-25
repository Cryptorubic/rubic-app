import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import BigNumber from 'bignumber.js';
import { FormType } from '@features/trade/models/form-type';
import { ShortenAmountPipe } from '@shared/pipes/shorten-amount.pipe';
import { TokenAmountDirective } from '@shared/directives/token-amount/token-amount.directive';
import { CurrencyConverterService } from '@app/features/trade/components/currency-converter-button/services/currency-converter.service';

@Component({
  selector: 'app-amount-transput',
  templateUrl: './amount-transput.component.html',
  styleUrls: ['./amount-transput.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmountTransputComponent {
  public readonly inputPlaceholder$ = this.translateService.get('errors.noEnteredAmount');

  public readonly outputPlaceholder = '';

  public readonly amount = new FormControl<string>('');

  public readonly defaultDecimals = 18;

  @Input() public tokenDecimals: number | null;

  @Input() public formType: FormType;

  @Input() public inputMode: 'input' | 'output' | 'combined';

  @Input() set amountValue(value: { visibleValue: string; actualValue: BigNumber } | null) {
    if (this.inputMode !== 'input' || (value?.actualValue && value?.actualValue.gt(0))) {
      this.updateAmountValue(value);
    }
  }

  @Output() public amountUpdated = new EventEmitter<{
    visibleValue: string;
    actualValue: BigNumber;
  }>();

  private updateAmountValue(value: { visibleValue: string; actualValue: BigNumber } | null): void {
    let newAmount = value?.actualValue ? value.visibleValue : '';

    if (this.inputMode !== 'input') {
      const shortenPipe = new ShortenAmountPipe();

      newAmount = value?.actualValue ? shortenPipe.transform(value?.visibleValue, 12, 6, true) : '';

      newAmount = TokenAmountDirective.transformValue(newAmount, this.tokenDecimals);
    }
    this.amount.setValue(newAmount, { emitViewToModelChange: false });
  }

  private get formattedAmount(): string {
    return this.amount?.value.split(',').join('');
  }

  public readonly isDollarMode$ = this.currencyConverterService.isDollarMode$;

  constructor(
    private readonly translateService: TranslateService,
    private readonly currencyConverterService: CurrencyConverterService
  ) {}

  public handleAmountChange(amount: string): void {
    if (this.inputMode !== 'output') {
      this.amount.setValue(amount, { emitViewToModelChange: false });
      this.amountUpdated.emit({
        visibleValue: amount,
        actualValue: new BigNumber(this.formattedAmount)
      });
    }
  }
}
