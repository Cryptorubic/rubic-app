import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';
import {
  RateLevel,
  rateLevelsData
} from '@features/swaps/features/limit-order/constants/rate-levels';

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

  public percentValueClass: string;

  private get formattedRate(): string {
    return this.rate.value.split(',').join('');
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly orderRateService: OrderRateService
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
    this.percentValueClass = levelData.class;
  }

  public onRateChange(rate: string): void {
    this.rate.setValue(rate, { emitViewToModelChange: false });
    this.orderRateService.updateRateByForm(rate);
  }
}
