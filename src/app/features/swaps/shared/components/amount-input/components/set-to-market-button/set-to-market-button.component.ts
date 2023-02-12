import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';

@Component({
  selector: 'app-set-to-market-button',
  templateUrl: './set-to-market-button.component.html',
  styleUrls: ['./set-to-market-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SetToMarketButtonComponent {
  constructor(private readonly orderRateService: OrderRateService) {}

  public onClick(): void {
    this.orderRateService.setRateToMarket();
  }
}
