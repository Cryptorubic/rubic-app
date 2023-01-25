import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LimitOrdersComponent } from '@features/history/limit-orders/components/limit-orders/limit-orders.component';

const routes: Routes = [{ path: 'limit-orders', component: LimitOrdersComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoryRoutingModule {}
