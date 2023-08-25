import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';

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

  @Input() set amountValue(value: BigNumber) {
    if (this.inputMode !== 'input' && value?.isFinite()) {
      this.handleAmountChange(value.toFixed());
    }
  }

  @Output() public amountUpdated = new EventEmitter<void>();

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
      this.updateInputValue();
    }
  }

  private updateInputValue(): void {
    const amount =
      this.formType === 'from'
        ? this.swapFormService.inputValue.fromAmount
        : this.swapFormService.outputValue.toAmount;
    const amountKey = this.formType === 'from' ? 'fromAmount' : 'toAmount';
    const controlKey = this.formType === 'from' ? 'inputControl' : 'outputControl';

    if (
      ((amount && !amount.isNaN()) || this.formattedAmount) &&
      !amount?.eq(this.formattedAmount)
    ) {
      this.swapFormService[controlKey].patchValue({
        [amountKey]: new BigNumber(this.formattedAmount)
      });
      this.amountUpdated.emit();
    }
  }
}
