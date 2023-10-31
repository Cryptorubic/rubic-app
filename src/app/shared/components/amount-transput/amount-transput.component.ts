import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { FormType } from '@features/trade/models/form-type';

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

  @Input() public selectedToken: TokenAmount | null;

  @Input() public formType: FormType;

  @Input() public inputMode: 'input' | 'output' | 'combined';

  @Input() set amountValue(value: { visibleValue: string; actualValue: BigNumber } | null) {
    if (this.inputMode !== 'input' || (value?.actualValue && value?.actualValue.gt(0))) {
      const newAmount = value?.actualValue ? value.visibleValue : '';
      this.amount.setValue(newAmount, { emitViewToModelChange: false });
    }
  }

  @Output() public amountUpdated = new EventEmitter<{
    visibleValue: string;
    actualValue: BigNumber;
  }>();

  private get formattedAmount(): string {
    return this.amount?.value.split(',').join('');
  }

  constructor(
    private readonly translateService: TranslateService,
    public readonly swapFormService: SwapsFormService
  ) {}

  public handleAmountChange(amount: string): void {
    if (this.inputMode !== 'output') {
      this.amount.setValue(amount, { emitViewToModelChange: false });
      this.amountUpdated.emit({
        visibleValue: this.formattedAmount,
        actualValue: new BigNumber(this.formattedAmount)
      });
    }
  }
}
