import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';
import { OrderBooksComponent } from './components/order-books/order-books.component';
import { TradesModule } from '../trades-module/trades.module';
import { OrderBooksFormComponent } from './components/order-books-form/order-books-form.component';
import { OrderBooksFormOptionsComponent } from './components/order-books-form/order-books-form-options/order-books-form-options.component';
import { SharedModule } from '../../../shared/shared.module';
import { OrderBooksFormService } from './services/order-book-form-service/order-books-form.service';
import { OrderBooksTableComponent } from './components/order-books-table/order-books-table.component';
import { CoinsFilterComponent } from './components/order-books-table/components/coins-dropdown/coins-filter.component';
import { TokensCellComponent } from './components/order-books-table/components/tokens-cell/tokens-cell.component';
import { VolumeCellComponent } from './components/order-books-table/components/volume-cell/volume-cell.component';

@NgModule({
  declarations: [
    OrderBooksComponent,
    OrderBooksFormComponent,
    OrderBooksFormOptionsComponent,
    OrderBooksTableComponent,
    CoinsFilterComponent,
    TokensCellComponent,
    VolumeCellComponent
  ],
  imports: [
    CommonModule,
    TradesModule,
    SharedModule,
    FormsModule,
    MatInputModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule,
    MatTableModule,
    MatSortModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [OrderBooksFormService],
  exports: [OrderBooksComponent]
})
export class OrderBooksModule {}
