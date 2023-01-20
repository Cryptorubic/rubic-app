import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-order-rate',
  templateUrl: './order-rate.component.html',
  styleUrls: ['./order-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderRateComponent {
  public rate = new FormControl<string>('');

  public onRateChange(rate: string): void {
    this.rate.setValue(rate, { emitViewToModelChange: false });
  }
}
