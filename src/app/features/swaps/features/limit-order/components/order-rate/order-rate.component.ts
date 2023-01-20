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

  private get formattedRate(): string {
    return this.rate.value.split(',').join('');
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly orderRateService: OrderRateService
  ) {}

  ngOnInit() {
    this.orderRateService.rate$.subscribe(rate => {
      if (!rate || rate.isNaN()) {
        this.rate.setValue('');
      } else if (!rate.eq(this.formattedRate)) {
        this.rate.setValue(rate.toFixed());
      }
      this.cdr.markForCheck();
    });
  }

  public onRateChange(rate: string): void {
    this.rate.setValue(rate, { emitViewToModelChange: false });
  }
}
