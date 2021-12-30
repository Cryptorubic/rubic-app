import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { FormControl } from '@ngneat/reactive-forms';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { startWith, takeUntil } from 'rxjs/operators';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';

@Component({
  selector: 'app-vertical-iframe-token-amount-input',
  templateUrl: './vertical-iframe-token-amount-input.component.html',
  styleUrls: ['./vertical-iframe-token-amount-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalIframeTokenAmountInputComponent implements OnInit {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() placeholder = '0.0';

  private get formattedAmount(): string {
    return this.amount.value.split(',').join('');
  }

  get usdPrice(): BigNumber {
    return new BigNumber(this.formattedAmount || 0).multipliedBy(this.selectedToken?.price ?? 0);
  }

  public readonly DEFAULT_DECIMALS = 18;

  public amount = new FormControl<string>('');

  public selectedToken: TokenAmount;

  constructor(
    public readonly swapFormService: SwapFormService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        const { fromAmount, fromToken } = form;

        if (!fromAmount || fromAmount.isNaN()) {
          this.amount.setValue('');
        } else if (!fromAmount.eq(this.formattedAmount)) {
          this.amount.setValue(fromAmount.toFixed());
        }

        this.selectedToken = fromToken;
      });
  }

  public onUserBalanceMaxButtonClick(): void {
    this.amount.setValue(this.selectedToken.amount.toFixed());
  }

  public onAmountChange(amount: string): void {
    this.amount.setValue(amount, { emitViewToModelChange: false });
    this.updateInputValue();
  }

  private updateInputValue(): void {
    const { fromAmount } = this.swapFormService.inputValue;
    if (
      ((fromAmount && !fromAmount.isNaN()) || this.formattedAmount) &&
      !fromAmount?.eq(this.formattedAmount)
    ) {
      this.swapFormService.input.patchValue({
        fromAmount: new BigNumber(this.formattedAmount)
      });
    }
  }
}
