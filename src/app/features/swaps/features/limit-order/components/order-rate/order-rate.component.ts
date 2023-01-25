import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';
import {
  RateLevel,
  rateLevelsData
} from '@features/swaps/features/limit-order/constants/rate-levels';
import { SwapFormService } from '@app/core/services/swaps/swap-form.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-order-rate',
  templateUrl: './order-rate.component.html',
  styleUrls: ['./order-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderRateComponent implements OnInit {
  public rate = new FormControl<string>('');

  public percentDiff = 0;

  public iconSrc: string;

  public levelClass: string;

  public fromTokenName$ = this.swapFormService.fromToken$.pipe(map(token => token?.symbol || ''));

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
    private readonly swapFormService: SwapFormService
  ) {}

  ngOnInit() {
    this.orderRateService.rate$.subscribe(({ value, percentDiff }) => {
      if (!value?.isFinite()) {
        this.rate.setValue('');
      } else if (!value.eq(this.formattedRate)) {
        this.rate.setValue(value.toFixed());
      }
      this.percentDiff = percentDiff;
      this.updateRateLevelData();
      this.cdr.markForCheck();
    });
  }

  private updateRateLevelData(): void {
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
    const levelData = rateLevelsData[level];
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
}
