import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { LimitOrdersService } from '@core/services/limit-orders/limit-orders.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { map } from 'rxjs/operators';

@Component({
  selector: 'polymorpheus-limit-orders',
  templateUrl: './limit-orders.component.html',
  styleUrls: ['./limit-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LimitOrdersComponent implements OnInit {
  public readonly isMobile$ = this.windowWidthService.windowSize$.pipe(
    map(size => size <= WindowSize.LAPTOP)
  );

  public readonly orders$ = this.limitOrdersService.orders$;

  public readonly loading$ = this.limitOrdersService.loading$;

  constructor(
    private readonly router: Router,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext,
    private readonly windowWidthService: WindowWidthService,
    private readonly limitOrdersService: LimitOrdersService
  ) {}

  public ngOnInit(): void {
    this.limitOrdersService.shouldUpdateOrders();
  }

  public onClose(): void {
    this.context.completeWith(null);
  }

  public navigateToLimitOrder(): void {
    this.router.navigate(['/limit-order']).then(() => this.context.completeWith(null));
  }
}
