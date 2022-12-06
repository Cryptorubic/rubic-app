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
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { takeUntil } from 'rxjs/operators';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-vertical-iframe-token-amount-input',
  templateUrl: './vertical-iframe-token-amount-input.component.html',
  styleUrls: ['./vertical-iframe-token-amount-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalIframeTokenAmountInputComponent implements OnInit {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  public readonly placeholder$ = this.translateService.get('errors.noEnteredAmount');

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
    private readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.swapFormService.inputValue$.pipe(takeUntil(this.destroy$)).subscribe(form => {
      const { fromAmount, fromAsset } = form;

      if (!fromAmount || fromAmount.isNaN()) {
        this.amount.setValue('');
      } else if (!fromAmount.eq(this.formattedAmount)) {
        this.amount.setValue(fromAmount.toFixed());
      }

      this.selectedToken = fromAsset as TokenAmount;
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
      this.swapFormService.inputControl.patchValue({
        fromAmount: new BigNumber(this.formattedAmount)
      });
    }
  }
}
