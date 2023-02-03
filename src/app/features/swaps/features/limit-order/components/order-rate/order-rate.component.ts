import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Self } from '@angular/core';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';
import {
  RateLevel,
  RateLevelData,
  rateLevelsData
} from '@features/swaps/shared/constants/limit-orders/rate-levels';
import { map, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { PercentInfo } from '@features/swaps/features/limit-order/models/percent-info';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-order-rate',
  templateUrl: './order-rate.component.html',
  styleUrls: ['./order-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class OrderRateComponent implements OnInit {
  public rate = new BigNumber(0);

  public percentInfo: PercentInfo;

  public isRateUknown: boolean;

  public rateDirection: 'from-to' | 'to-from' = 'from-to';

  public fromTokenName$ = this.swapFormService.fromToken$.pipe(map(token => token?.symbol || ''));

  public toTokenName$ = this.swapFormService.toToken$.pipe(map(token => token?.symbol || ''));

  public get formattedPercentDiff(): string {
    const percent = Math.abs(this.percentInfo.percent).toString();
    if (this.percentInfo.percent >= 100) {
      return percent.slice(0, 3);
    }
    return percent;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly orderRateService: OrderRateService,
    private readonly swapFormService: SwapFormService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.orderRateService.rate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ value, percentDiff }) => {
        if (!value?.isFinite()) {
          this.isRateUknown = true;
        } else if (!value.eq(this.rate)) {
          this.isRateUknown = false;
          this.updateRateFormValue();
        }
        this.updateRateLevelData(percentDiff);

        this.cdr.markForCheck();
      });
  }

  private updateRateLevelData(percentDiff: number): void {
    let levelData: RateLevelData;
    if (this.isRateUknown) {
      levelData = rateLevelsData[RateLevel.WARNING];
    } else {
      let level: RateLevel;
      if (percentDiff <= -10) {
        level = RateLevel.ERROR;
      } else if (percentDiff <= -5) {
        level = RateLevel.WARNING;
      } else if (percentDiff <= 0) {
        level = RateLevel.NOTHING;
      } else {
        level = RateLevel.FINE;
      }
      levelData = rateLevelsData[level];
    }

    this.percentInfo = {
      percent: percentDiff,
      iconSrc: levelData.imgSrc,
      className: levelData.class
    };
  }

  public toggleRateDirection(): void {
    this.rateDirection = this.rateDirection === 'from-to' ? 'to-from' : 'from-to';
    if (this.rate.isFinite() && this.rate.gt(0)) {
      this.updateRateFormValue();
    }
  }

  public updateRateFormValue(): void {
    const marketRate = this.orderRateService.marketRate;
    if (this.rateDirection === 'from-to') {
      this.rate = marketRate;
    } else {
      this.rate = new BigNumber(1).div(marketRate).dp(6);
    }
  }
}
