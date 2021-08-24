import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { startWith } from 'rxjs/operators';
import { TokenAmount } from '../../models/tokens/TokenAmount';

@Component({
  selector: 'app-token-amount-input',
  templateUrl: './token-amount-input.component.html',
  styleUrls: ['./token-amount-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenAmountInputComponent implements OnInit {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() placeholder = '0.0';

  private get formattedAmount(): string {
    return this.amount.split(',').join('');
  }

  public readonly DEFAULT_DECIMALS = 18;

  public amount: string;

  public selectedToken: TokenAmount;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapsService: SwapsService,
    public readonly swapFormService: SwapFormService
  ) {}

  ngOnInit() {
    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue))
      .subscribe(form => {
        const { fromAmount, fromToken } = form;

        if (!fromAmount || fromAmount.isNaN()) {
          this.amount = '';
        } else if (!fromAmount.eq(this.formattedAmount)) {
          this.amount = fromAmount.toFixed();
        }

        this.selectedToken = fromToken;

        this.cdr.detectChanges();
      });
  }

  public onUserBalanceMaxButtonClick(): void {
    this.amount = this.selectedToken.amount.toFixed();
  }

  public getUsdPrice(): BigNumber {
    return new BigNumber(this.formattedAmount || 0).multipliedBy(this.selectedToken?.price || 0);
  }

  public emitAmountChange(amount: string): void {
    this.amount = amount;
    const { fromAmount } = this.swapFormService.inputValue;
    if ((fromAmount || this.amount) && !fromAmount?.eq(this.amount)) {
      this.swapFormService.input.patchValue({
        fromAmount: new BigNumber(this.formattedAmount)
      });
    }
  }
}
