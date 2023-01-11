import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LimitOrderFormService } from '@features/swaps/features/limit-order/services/limit-order-form.service';

@Component({
  selector: 'app-limit-order-bottom-form',
  templateUrl: './limit-order-bottom-form.component.html',
  styleUrls: ['./limit-order-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LimitOrderBottomFormComponent {
  public readonly tradeStatus$ = this.limitOrderFormService.tradeStatus$;

  constructor(private readonly limitOrderFormService: LimitOrderFormService) {}

  public async onCreateOrder(): Promise<void> {
    await this.limitOrderFormService.onCreateOrder();
  }
}
