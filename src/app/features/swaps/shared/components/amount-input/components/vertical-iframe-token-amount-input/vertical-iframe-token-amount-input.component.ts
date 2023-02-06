import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { takeUntil } from 'rxjs/operators';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { AssetType } from '@features/swaps/shared/models/form/asset';
import { isMinimalToken } from '@shared/utils/is-token';

@Component({
  selector: 'app-vertical-iframe-token-amount-input',
  templateUrl: './vertical-iframe-token-amount-input.component.html',
  styleUrls: ['./vertical-iframe-token-amount-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalIframeTokenAmountInputComponent implements OnInit {
  public readonly placeholder$ = this.translateService.get('errors.noEnteredAmount');

  private get formattedAmount(): string {
    return this.amount.value.split(',').join('');
  }

  public readonly DEFAULT_DECIMALS = 18;

  public amount = new FormControl<string>('');

  public selectedAssetType: AssetType;

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

      if (fromAsset) {
        this.selectedAssetType = isMinimalToken(fromAsset) ? fromAsset.blockchain : 'fiat';
      } else {
        this.selectedAssetType = null;
      }
      this.selectedToken = isMinimalToken(fromAsset) ? fromAsset : null;
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
