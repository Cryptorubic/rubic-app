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
import { TradeStatus } from '@shared/models/swaps/trade-status';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { PriceImpactRange } from '@shared/models/swaps/price-impact-range';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { combineLatest } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';

@Component({
  selector: 'app-swap-button',
  templateUrl: './swap-button.component.html',
  styleUrls: ['./swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapButtonComponent implements OnInit {
  @Input() idPrefix: string;

  @Input() set status(status: TradeStatus) {
    if (
      status === TradeStatus.LOADING &&
      this.swapsService.swapMode !== SWAP_PROVIDER_TYPE.BRIDGE &&
      !this.iframeService.isIframe
    ) {
      this.priceImpact = undefined;
    }
    this._status = status;
  }

  get status(): TradeStatus {
    return this._status;
  }

  @Input() checkingOnErrors: boolean;

  /**
   * Text inside button.
   */
  @Input() buttonText: string;

  @Output() onClick = new EventEmitter<void>();

  public readonly PRICE_IMPACT_RANGE = PriceImpactRange;

  public readonly TRADE_STATUS = TradeStatus;

  private _status: TradeStatus;

  /**
   * Price impact of trade in percents.
   */
  public priceImpact: number;

  public get showLoader(): boolean {
    return (
      this.checkingOnErrors ||
      this.status === TradeStatus.SWAP_IN_PROGRESS ||
      this.status === TradeStatus.LOADING ||
      (this.status === TradeStatus.READY_TO_SWAP && this.priceImpact === undefined)
    );
  }

  public get disabled(): boolean {
    return (
      this.status !== TradeStatus.READY_TO_SWAP ||
      this.priceImpact >= PriceImpactRange.HIGH_DISABLED ||
      this.showLoader
    );
  }

  /**
   * Returns true, if button should be warned medium.
   */
  public get warningMedium(): boolean {
    return (
      this.status !== TradeStatus.DISABLED &&
      ((PriceImpactRange.MEDIUM <= this.priceImpact && this.priceImpact < PriceImpactRange.HIGH) ||
        this.priceImpact === null)
    );
  }

  /**
   * Returns true, if button should be warned high.
   */
  public get warningHigh(): boolean {
    return this.status !== TradeStatus.DISABLED && this.priceImpact >= PriceImpactRange.HIGH;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapsService: SwapsService,
    private readonly priceImpactService: PriceImpactService,
    private readonly iframeService: IframeService,
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

  private setPriceImpact(): void {
    if (this.iframeService.isIframe || this.swapsService.swapMode === SWAP_PROVIDER_TYPE.BRIDGE) {
      this.priceImpact = 0;
      return;
    }
    this.priceImpact = this.priceImpactService.priceImpact;
  }

  public onSwapClick(): void {
    if (this.priceImpact >= PriceImpactRange.HIGH) {
      if (
        // eslint-disable-next-line no-alert
        prompt(
          `This swap has a price impact of ${PriceImpactRange.HIGH}% or more. Please type the word "confirm" to continue with this swap.\n\nPlease, take into account, that a non-refundable loss may happen. You’ll possibly loose the major part of the assets you are transferring.`
        ) !== 'confirm'
      ) {
        return;
      }
    }
    this.onClick.emit();
  }
}
