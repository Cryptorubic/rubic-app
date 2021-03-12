import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderBooksComponent } from './components/order-books/order-books.component';

@NgModule({
  declarations: [OrderBooksComponent],
  exports: [OrderBooksComponent],
  imports: [CommonModule]
})
export class OrderBooksModule {}
