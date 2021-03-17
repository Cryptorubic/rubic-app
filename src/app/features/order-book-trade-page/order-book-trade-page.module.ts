import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { OrderBookTradePageRoutingModule } from './order-book-trade-page-routing.module';
import { OrderBookTradeComponent } from './components/order-book-trade/order-book-trade.component';
import { SharedModule } from '../../shared/shared.module';
import { OrderBookTradeResolver } from './components/order-book-trade/order-book-trade.resolver';
import { OrderBookTradeService } from './components/services/order-book-trade.service';

@NgModule({
  declarations: [OrderBookTradeComponent],
  imports: [CommonModule, OrderBookTradePageRoutingModule, SharedModule, ClipboardModule],
  providers: [OrderBookTradeResolver, OrderBookTradeService]
})
export class OrderBookTradePageModule {}
