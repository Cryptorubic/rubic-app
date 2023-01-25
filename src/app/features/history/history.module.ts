import { NgModule } from '@angular/core';
import { HistoryRoutingModule } from '@features/history/history-routing.module';
import { LimitOrdersComponent } from '@features/history/limit-orders/components/limit-orders/limit-orders.component';
import { SharedModule } from '@shared/shared.module';
import { TuiLoaderModule } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { OrderRowComponent } from '@features/history/limit-orders/components/order-row/order-row.component';

@NgModule({
  declarations: [LimitOrdersComponent, OrderRowComponent],
  imports: [CommonModule, HistoryRoutingModule, SharedModule, TuiLoaderModule],
  providers: []
})
export class HistoryModule {}
