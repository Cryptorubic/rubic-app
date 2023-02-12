import { ChangeDetectionStrategy, Component, Input, Self } from '@angular/core';
import { LimitOrderFormService } from '@features/swaps/features/limit-order/services/limit-order-form.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';
import { Observable } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-limit-order-bottom-form',
  templateUrl: './limit-order-bottom-form.component.html',
  styleUrls: ['./limit-order-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class LimitOrderBottomFormComponent {
  @Input() fromAmountUpdated$: Observable<void>;

  public readonly tradeStatus$ = this.limitOrderFormService.tradeStatus$;

  public readonly displayApproveButton$ = this.limitOrderFormService.displayApproveButton$;

  constructor(
    private readonly limitOrderFormService: LimitOrderFormService,
    private readonly orderRateService: OrderRateService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public needApprove(tradeStatus: TRADE_STATUS): boolean {
    return tradeStatus === TRADE_STATUS.READY_TO_APPROVE;
  }

  public async onApprove(): Promise<void> {
    await this.limitOrderFormService.approve();
  }

  public async onCreateOrder(): Promise<void> {
    await this.limitOrderFormService.onCreateOrder();
  }
}
