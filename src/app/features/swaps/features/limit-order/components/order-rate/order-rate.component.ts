import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';

@Component({
  selector: 'app-order-rate',
  templateUrl: './order-rate.component.html',
  styleUrls: ['./order-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderRateComponent implements OnInit {
  public rate = new FormControl<string>('');

  public percentDiff = 0;

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
      this.cdr.markForCheck();
    });
  }

  public onRateChange(rate: string): void {
    this.rate.setValue(rate, { emitViewToModelChange: false });
    this.orderRateService.updateRateByForm(rate);
  }
}
