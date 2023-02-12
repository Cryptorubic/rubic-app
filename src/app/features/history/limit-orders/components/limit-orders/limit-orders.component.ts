import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { Router } from '@angular/router';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { LimitOrdersService } from '@core/services/limit-orders/limit-orders.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { map, takeUntil } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-limit-orders',
  templateUrl: './limit-orders.component.html',
  styleUrls: ['./limit-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class LimitOrdersComponent implements OnInit {
  public readonly isMobile$ = this.windowWidthService.windowSize$.pipe(
    map(size => size <= WindowSize.LAPTOP)
  );

  public readonly orders$ = this.limitOrdersService.orders$;

  public readonly loading$ = this.limitOrdersService.loading$;

  public readonly user$ = this.authService.currentUser$;

  public readonly isRefreshRotating$ = this.limitOrdersService.loading$;

  constructor(
    private readonly router: Router,
    private readonly windowWidthService: WindowWidthService,
    private readonly limitOrdersService: LimitOrdersService,
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.limitOrdersService.updateOrders();
    });
  }

  public navigateToLimitOrder(): void {
    this.router.navigate(['/limit-order']);
  }

  public onLogin(): void {
    this.walletsModalService.open().subscribe();
  }

  public onRefresh(): void {
    this.limitOrdersService.updateOrders();
  }
}
