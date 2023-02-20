import { Component } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { LimitOrdersService } from '@app/core/services/limit-orders/limit-orders.service';

@Component({
  selector: 'app-limit-orders-list',
  templateUrl: './limit-orders-list.component.html',
  styleUrls: ['./limit-orders-list.component.scss']
})
export class LimitOrdersListComponent {
  public readonly orders$ = this.limitOrdersService.orders$;

  public readonly loading$ = this.limitOrdersService.loading$;

  constructor(
    private readonly limitOrdersService: LimitOrdersService,
    private readonly authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(() => {
      this.limitOrdersService.updateOrders();
    });
  }
}
