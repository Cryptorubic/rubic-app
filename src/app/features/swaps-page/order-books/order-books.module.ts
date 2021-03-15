import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderBooksComponent } from './components/order-books/order-books.component';
import { TradesModule } from '../trades-module/trades.module';

@NgModule({
  declarations: [OrderBooksComponent],
  exports: [OrderBooksComponent],
  imports: [CommonModule, TradesModule]
})
export class OrderBooksModule {}
