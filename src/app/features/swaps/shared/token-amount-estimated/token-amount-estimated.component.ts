import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Self
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { BlockchainName } from 'rubic-sdk';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith, takeUntil } from 'rxjs/operators';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/permited-price-difference';

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

  @Input() tokenDecimals = 18;

  private _loading: boolean;

  public usdPrice: BigNumber;

  public tokenAmount: BigNumber;

  public fromAmount: BigNumber = new BigNumber(null);

  public blockchain: BlockchainName;

  public hidden: boolean;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapFormService: SwapFormService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.subscribeOnFormChange();
    this.subscribeOnToTokenChange();
  }

  /**
   * Subscribes on form change, and after change updates token amount parameters.
   */
  private subscribeOnFormChange(): void {
    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        this.fromAmount = form.fromAmount ? form.fromAmount : new BigNumber(null);
        this.blockchain = form.toBlockchain;
      });

    this.swapFormService.outputValueChanges.pipe(takeUntil(this.destroy$)).subscribe(form => {
      if (!form?.toAmount?.isFinite()) {
        this.tokenAmount = null;
        this.usdPrice = null;
        this.cdr.markForCheck();
        return;
      }

      this.hidden = false;

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
    if (toTokenCost.minus(fromTokenCost).dividedBy(fromTokenCost).gt(PERMITTED_PRICE_DIFFERENCE)) {
      return new BigNumber(NaN);
    }
    return toTokenCost;
  }
}
