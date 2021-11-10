import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { PRICE_IMPACT_RANGE } from '@shared/models/swaps/PRICE_IMPACT_RANGE';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { combineLatest } from 'rxjs';

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

  @Input() set loading(value: boolean) {
    if (value) {
      this.showLoader = true;
    } else if (this.swapsService.swapMode === SWAP_PROVIDER_TYPE.BRIDGE) {
      this.showLoader = false;
    }
  }

  /**
   * Text inside button.
   */
  @Input() buttonText: string;

  /**
   * Service containing form with input and output data.
   */
  @Input() formService: SwapFormService;

  @Output() private onClick = new EventEmitter<void>();

  public PRICE_IMPACT_RANGE = PRICE_IMPACT_RANGE;

  public TRADE_STATUS = TRADE_STATUS;

  public showLoader: boolean;

  /**
   * Price impact of trade in percents.
   */
  public priceImpact: number;

  get disabled() {
    return (
      this.status !== TRADE_STATUS.READY_TO_SWAP ||
      this.priceImpact >= PRICE_IMPACT_RANGE.HIGH_DISABLED ||
      this.showLoader
    );
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapsService: SwapsService,
    private readonly priceImpactService: PriceImpactService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.priceImpact = 0;
  }

  ngOnInit(): void {
    combineLatest([this.swapsService.swapMode$, this.priceImpactService.priceImpact$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.setPriceImpact();
        this.cdr.markForCheck();
      });
  }

  private setPriceImpact() {
    if (this.swapsService.swapMode === SWAP_PROVIDER_TYPE.BRIDGE) {
      this.priceImpact = 0;
      return;
    }
    this.priceImpact = this.priceImpactService.priceImpact;
    this.showLoader = false;
  }

  public onSwapClick(): void {
    if (this.priceImpact >= PRICE_IMPACT_RANGE.HIGH) {
      if (
        // eslint-disable-next-line no-alert
        prompt(
          `This swap has a price impact of ${PRICE_IMPACT_RANGE.HIGH}% or more. Please type the word "confirm" to continue with this swap.\n\nPlease, take into account, that a non-refundable loss may happen. You’ll possibly loose the major part of the assets you are transferring.`
        ) !== 'confirm'
      ) {
        return;
      }
    }
    this.onClick.emit();
  }
}
