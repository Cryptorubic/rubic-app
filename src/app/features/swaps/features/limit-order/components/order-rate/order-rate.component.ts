import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';
import {
  RateLevel,
  RateLevelData,
  rateLevelsData
} from '@features/swaps/shared/constants/limit-orders/rate-levels';
import { SwapFormService } from '@app/core/services/swaps/swap-form.service';
import { map, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-order-rate',
  templateUrl: './order-rate.component.html',
  styleUrls: ['./order-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class OrderRateComponent implements OnInit {
  public rate = new FormControl<string>('');

  public percentDiff = 0;

  public iconSrc: string;

  public levelClass: string;

  public fromTokenName$ = this.swapFormService.fromToken$.pipe(map(token => token?.symbol || ''));

  public isUnknown: boolean;

  public isFixed = this.orderRateService.isFixed;

  private get formattedRate(): string {
    return this.rate.value.split(',').join('');
  }

  public get formattedPercentDiff(): string {
    let percent = Math.abs(this.percentDiff).toString().slice(0, 3);
    if (percent[percent.length - 1] === '.') {
      percent = percent.slice(0, 2);
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
      .subscribe(({ value, percentDiff, unknown }) => {
        if (!value?.isFinite()) {
          this.rate.setValue('');
        } else if (!value.eq(this.formattedRate)) {
          this.rate.setValue(value.toFixed());
        }
        this.percentDiff = percentDiff;
        this.isUnknown = unknown;
        this.updateRateLevelData();
        this.cdr.markForCheck();
      });
  }

  private updateRateLevelData(): void {
    let levelData: RateLevelData;
    if (this.isUnknown) {
      levelData = rateLevelsData[RateLevel.YELLOW];
    } else {
      let level: RateLevel;
      if (this.percentDiff <= -10) {
        level = RateLevel.RED;
      } else if (this.percentDiff <= -5) {
        level = RateLevel.YELLOW;
      } else if (this.percentDiff <= 0) {
        level = RateLevel.NOTHING;
      } else {
        level = RateLevel.GREEN;
      }
      levelData = rateLevelsData[level];
    }

    this.iconSrc = levelData.imgSrc;
    this.levelClass = levelData.class;
  }

  public onRateChange(formRate: string): void {
    this.rate.setValue(formRate, { emitViewToModelChange: false });
    const rate = this.orderRateService.rateValue;
    if (((rate && !rate.isNaN()) || this.formattedRate) && !rate?.eq(this.formattedRate)) {
      this.orderRateService.updateRate(this.formattedRate, true);
    }
  }

  public setRateToMarket(): void {
    this.orderRateService.setRateToMarket();
  }

  public setRateFixed(): void {
    this.isFixed = !this.isFixed;
    this.orderRateService.isFixed = this.isFixed;
  }
}
