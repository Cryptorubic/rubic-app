import { Component, Inject, Self } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { LimitOrdersService } from '@app/core/services/limit-orders/limit-orders.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { Router } from '@angular/router';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-limit-orders-list',
  templateUrl: './limit-orders-list.component.html',
  styleUrls: ['./limit-orders-list.component.scss'],
  providers: [TuiDestroyService]
})
export class LimitOrdersListComponent {
  public readonly orders$ = this.limitOrdersService.orders$;

  public readonly loading$ = this.limitOrdersService.loading$;

  public readonly user$ = this.authService.currentUser$;

  constructor(
    private readonly limitOrdersService: LimitOrdersService,
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService,
    private readonly router: Router,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.limitOrdersService.updateOrders();
    });
  }

  public onLogin(): void {
    this.walletsModalService.open().subscribe();
  }

  public navigateToLimitOrder(): void {
    this.context.completeWith(null);
    this.router.navigate(['/limit-order']);
  }
}
