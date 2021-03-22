import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderBookTradeComponent } from './components/order-book-trade/order-book-trade.component';

const routes: Routes = [
  {
    path: '',
    component: OrderBookTradeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderBookTradePageRoutingModule {}
