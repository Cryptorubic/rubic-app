import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { startWith, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { PriceImpactCalculator } from '@shared/utils/price-impact/price-impact-calculator';
import { PRICE_IMPACT_RANGE } from '@shared/utils/price-impact/models/PRICE_IMPACT_RANGE';

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
  @Input() formService: SwapFormService;

  @Output() onClick = new EventEmitter<void>();

  public PRICE_IMPACT_RANGE = PRICE_IMPACT_RANGE;

  public TRADE_STATUS = TRADE_STATUS;

  /**
   * Price impact of trade in percents.
   */
  public priceImpact: number;

  get disabled() {
    return this.status !== TRADE_STATUS.READY_TO_SWAP;
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
    if (this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
      const { fromToken, toToken, fromAmount } = this.formService.inputValue;
      const { toAmount } = this.formService.outputValue;
      this.priceImpact = PriceImpactCalculator.calculateItPriceImpact(
        fromToken,
        toToken,
        fromAmount,
        toAmount
      );
      return;
    }

    this.priceImpact = 0;
  }
}
