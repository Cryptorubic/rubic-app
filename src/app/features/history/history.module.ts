import { NgModule } from '@angular/core';
import { HistoryRoutingModule } from '@features/history/history-routing.module';
import { LimitOrdersComponent } from '@features/history/limit-orders/components/limit-orders/limit-orders.component';
import { SharedModule } from '@shared/shared.module';
import { TuiHintModule, TuiLoaderModule } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { OrderRowComponent } from '@features/history/limit-orders/components/order-row/order-row.component';
import { LimitOrdersListComponent } from './limit-orders/components/limit-orders-list/limit-orders-list.component';

@NgModule({
  declarations: [LimitOrdersComponent, LimitOrdersListComponent, OrderRowComponent],
  imports: [CommonModule, HistoryRoutingModule, SharedModule, TuiLoaderModule, TuiHintModule],
  providers: [],
  exports: [LimitOrdersListComponent]
})
export class HistoryModule {}
