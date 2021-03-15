import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OrderBooksComponent } from './components/order-books/order-books.component';
import { TradesModule } from '../trades-module/trades.module';
import { OrderBooksFormComponent } from './components/order-book-form/order-books-form.component';
import { OrderBooksFormOptionsComponent } from './components/order-book-form/order-books-form-options/order-books-form-options.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [OrderBooksComponent, OrderBooksFormComponent, OrderBooksFormOptionsComponent],
  imports: [
    CommonModule,
    TradesModule,
    SharedModule,
    FormsModule,
    MatInputModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule
  ],
  exports: [OrderBooksComponent]
})
export class OrderBooksModule {}
