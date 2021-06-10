import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderBooksComponent } from './components/order-books/order-books.component';
import { TradesModule } from '../trades-module/trades.module';
import { OrderBooksFormComponent } from './components/order-books-form/order-books-form.component';
import { OrderBooksFormOptionsComponent } from './components/order-books-form/order-books-form-options/order-books-form-options.component';
import { OrderBooksTableComponent } from './components/order-books-table/order-books-table.component';
import { OrderBooksFormService } from './components/order-books-form/services/order-books-form.service';
import { OrderBooksTableService } from './components/order-books-table/services/order-books-table.service';

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
    NgxMaterialTimepickerModule,
    ReactiveFormsModule,
    RouterModule,
    MatTooltipModule
  ],
  exports: [OrderBooksComponent],
  providers: [OrderBooksFormService, OrderBooksTableService]
})
export class OrderBooksOldModule {}
