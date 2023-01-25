import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { LimitOrdersService } from '@core/services/limit-orders/limit-orders.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-limit-orders',
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
    private readonly windowWidthService: WindowWidthService,
    private readonly limitOrdersService: LimitOrdersService
  ) {}

  public ngOnInit(): void {
    this.limitOrdersService.shouldUpdateOrders();
  }

  public navigateToLimitOrder(): void {
    this.router.navigate(['/limit-order']);
  }
}
