import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OrderBooksComponent } from './components/order-books/order-books.component';
import { TradesModule } from '../trades-module/trades.module';
import { OrderBooksFormComponent } from './components/order-books-form/order-books-form.component';
import { OrderBooksFormOptionsComponent } from './components/order-books-form/order-books-form-options/order-books-form-options.component';
import { SharedModule } from '../../../shared/shared.module';
import { OrderBooksFormService } from './services/order-book-form-service/order-books-form.service';
import { OrderBooksTableComponent } from './components/order-books-table/order-books-table.component';

@NgModule({
  declarations: [
    OrderBooksComponent,
    OrderBooksFormComponent,
    OrderBooksFormOptionsComponent,
    OrderBooksTableComponent
  ],
  imports: [
    CommonModule,
    TradesModule,
    SharedModule,
    FormsModule,
    MatInputModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule
  ],
  providers: [OrderBooksFormService],
  exports: [OrderBooksComponent]
})
export class OrderBooksModule {}
