import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { SwapsPageComponent } from './components/swaps-page-component/swaps-page.component';
import { SwapsPageRoutingModule } from './swaps-page-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { OrderBooksModule } from '../order-books/order-books.module';
import { InstantTradesModule } from '../instant-trades/instant-trades.module';

@NgModule({
  declarations: [SwapsPageComponent],
  imports: [
    CommonModule,
    SwapsPageRoutingModule,
    SharedModule,
    FormsModule,
    NgxMaterialTimepickerModule,
    MatDatepickerModule,
    MatInputModule,
    InstantTradesModule,
    OrderBooksModule
  ]
})
export class SwapsPageModule {}
