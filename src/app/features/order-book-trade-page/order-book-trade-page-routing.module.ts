import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderBookTradeComponent } from './components/order-book-trade/order-book-trade.component';
import { OrderBookTradeResolver } from './components/order-book-trade/order-book-trade.resolver';

const routes: Routes = [
  {
    path: '',
    component: OrderBookTradeComponent,
    resolve: {
      tradeData: OrderBookTradeResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderBookTradePageRoutingModule {}
