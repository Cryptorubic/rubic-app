import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { OrderBooksComponent } from './components/order-books/order-books.component';
import { TradesModule } from '../trades-module/trades.module';
import { OrderBooksFormComponent } from './components/order-books-form/order-books-form.component';
import { OrderBooksFormOptionsComponent } from './components/order-books-form/order-books-form-options/order-books-form-options.component';
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
  exports: [OrderBooksComponent],
  providers: [
    OrderBooksFormService,
    {
      provide: TradeTypeService,
      useClass: TradeTypeService
    },
    {
      provide: TradeParametersService,
      useClass: TradeParametersService
    }
  ]
})
export class OrderBooksModule {}
