import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Self
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { PermitedPriceDifference } from '@shared/constants/common/permited-price-difference';

@Component({
  selector: 'app-amount-estimated',
  templateUrl: './token-amount-estimated.component.html',
  styleUrls: ['./token-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class AmountEstimatedComponent implements OnInit {
  @Input() set loading(value: boolean) {
    this._loading = value;
    if (value) {
      this.hidden = false;
    }
  }

  get loading(): boolean {
    return this._loading;
  }

  @Input() disabled: boolean;

  @Input() errorText = '';

  private _loading: boolean;

  public usdPrice: BigNumber;

  public tokenAmount: BigNumber;

  public blockchain: BLOCKCHAIN_NAME;

  public hidden: boolean;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapFormService: SwapFormService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.subscribeOnOutputChange();
    this.subscribeOnToTokenChange();
  }

  /**
   * Subscribes on output form change, and after change updates token amount parameters.
   */
  private subscribeOnOutputChange(): void {
    this.swapFormService.outputValueChanges.pipe(takeUntil(this.destroy$)).subscribe(form => {
      if (!form?.toAmount.isFinite()) {
        this.hidden = true;
        this.tokenAmount = null;
        this.usdPrice = null;
        this.cdr.markForCheck();
        return;
      }

      this.hidden = false;

      this.blockchain = this.swapFormService.inputValue.toBlockchain;
      this.tokenAmount = form.toAmount.lte(0) ? new BigNumber(0) : form.toAmount;
      this.usdPrice = this.getUsdPrice();

      this.cdr.markForCheck();
    });
  }

  /**
   * Subscribes on to token change, and after change updates usd price.
   */
  private subscribeOnToTokenChange(): void {
    this.swapFormService.input.controls.toToken.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.tokenAmount) {
          this.usdPrice = this.getUsdPrice();
          this.cdr.markForCheck();
        }
      });
  }

  private getUsdPrice(): BigNumber {
    const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;
    const fromTokenCost = fromAmount.multipliedBy(fromToken?.price);
    const toTokenCost = this.tokenAmount?.multipliedBy(toToken?.price);
    if (toTokenCost.minus(fromTokenCost).dividedBy(fromTokenCost).gt(PermitedPriceDifference)) {
      return new BigNumber(NaN);
    }
    return toTokenCost;
  }
}
