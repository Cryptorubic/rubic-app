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
import { startWith, takeUntil } from 'rxjs/operators';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { FormControl } from '@ngneat/reactive-forms';

@Component({
  selector: 'app-token-amount-input',
  templateUrl: './token-amount-input.component.html',
  styleUrls: ['./token-amount-input.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenAmountInputComponent implements OnInit {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() maxGasFee: BigNumber = new BigNumber(0);

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

  private prevSwapMode: SWAP_PROVIDER_TYPE;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapsService: SwapsService,
    public readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
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
        } else if (
          this.swapsService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING &&
          this.prevSwapMode !== this.swapsService.swapMode
        ) {
          this.checkMaxAmountInCrossChainRouting();
        }

        this.prevSwapMode = this.swapsService.swapMode;
        this.selectedToken = fromToken;
      });

    this.settingsService.crossChainRoutingValueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.swapsService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING) {
          this.checkMaxAmountInCrossChainRouting();
        }
      });
  }

  private checkMaxAmountInCrossChainRouting() {
    const maxAmount = this.getMaxAmountInCrossChainRouting();
    if (
      maxAmount &&
      this.formattedAmount &&
      new BigNumber(maxAmount).gt(0) &&
      new BigNumber(maxAmount).lt(this.formattedAmount)
    ) {
      this.amount.setValue(maxAmount);
    }
  }

  private getMaxAmountInCrossChainRouting(): string {
    if (!this.selectedToken?.amount || this.selectedToken.amount.isNaN()) {
      return null;
    }

    const slippage = 1 + this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    return this.selectedToken.amount.dividedBy(slippage).toFixed();
  }

  public onUserBalanceMaxButtonClick(): void {
    const { swapMode } = this.swapsService;
    if (swapMode !== SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING) {
      this.amount.setValue(this.selectedToken.amount.toFixed());
    } else {
      this.amount.setValue(this.getMaxAmountInCrossChainRouting());
    }
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
