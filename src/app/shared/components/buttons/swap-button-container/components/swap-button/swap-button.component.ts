import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { PRICE_IMPACT } from 'src/app/shared/components/buttons/swap-button-container/models/PRICE_IMPACT';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { startWith, takeUntil } from 'rxjs/operators';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import BigNumber from 'bignumber.js';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';

@Component({
  selector: 'app-swap-button',
  templateUrl: './swap-button.component.html',
  styleUrls: ['./swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapButtonComponent implements OnInit {
  @Input() idPrefix: string;

  @Input() status: TRADE_STATUS;

  @Input() loading: boolean;

  /**
   * Text inside button.
   */
  @Input() buttonText: string;

  /**
   * Service containing form with input and output data.
   */
  @Input() formService: FormService;

  @Output() onClick = new EventEmitter<void>();

  public PRICE_IMPACT = PRICE_IMPACT;

  public TRADE_STATUS = TRADE_STATUS;

  /**
   * Price impact of trade in percents.
   */
  public priceImpact: number;

  get disabled() {
    return this.status !== TRADE_STATUS.READY_TO_SWAP;
  }

  private static isSwapForm(inputForm: ISwapFormInput): inputForm is SwapFormInput {
    return 'fromAmount' in inputForm;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapsService: SwapsService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.priceImpact = 0;
  }

  ngOnInit(): void {
    this.formService.outputValueChanges
      .pipe(startWith(this.formService.outputValue), takeUntil(this.destroy$))
      .subscribe(() => {
        this.setPriceImpact();
        this.cdr.detectChanges();
      });
  }

  private setPriceImpact() {
    if (this.swapsService.swapMode === SWAP_PROVIDER_TYPE.BRIDGE) {
      this.priceImpact = 0;
      return;
    }

    const inputForm = this.formService.inputValue;
    const outputForm = this.formService.outputValue;

    const { fromToken, toToken } = inputForm;
    let fromAmount: BigNumber;
    if (SwapButtonComponent.isSwapForm(inputForm)) {
      fromAmount = inputForm.fromAmount;
    }
    const { toAmount } = outputForm;
    if (!fromToken?.price || !toToken?.price || !fromAmount?.isFinite() || !toAmount?.isFinite()) {
      this.priceImpact = 0;
      return;
    }

    const fromTokenCost = fromAmount.multipliedBy(fromToken.price);
    const toTokenCost = toAmount.multipliedBy(toToken.price);
    this.priceImpact = fromTokenCost
      .minus(toTokenCost)
      .dividedBy(fromTokenCost)
      .multipliedBy(100)
      .dp(2, BigNumber.ROUND_HALF_UP)
      .toNumber();
  }
}
