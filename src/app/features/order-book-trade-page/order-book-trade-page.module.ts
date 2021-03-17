import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { OrderBookTradePageRoutingModule } from './order-book-trade-page-routing.module';
import { OrderBookTradeComponent } from './components/order-book-trade/order-book-trade.component';
import { SharedModule } from '../../shared/shared.module';
import { OrderBookTradeService } from './services/order-book-trade.service';
import { WithdrawButtonComponent } from './components/withdraw-button/withdraw-button.component';

@NgModule({
  declarations: [OrderBookTradeComponent, WithdrawButtonComponent],
  imports: [CommonModule, OrderBookTradePageRoutingModule, SharedModule, ClipboardModule],
  providers: [OrderBookTradeService]
})
export class OrderBookTradePageModule {}
