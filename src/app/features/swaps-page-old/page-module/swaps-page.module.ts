import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { OrderBooksOldModule } from 'src/app/features/swaps-page-old/order-books/order-books-old.module';
import { InstantTradesOldModule } from 'src/app/features/swaps-page-old/instant-trades/instant-trades-old.module';
import { SwapsPageComponent } from './components/swaps-page-component/swaps-page.component';
import { SwapsPageRoutingModule } from './swaps-page-routing.module';
import { SharedModule } from '../../../shared/shared.module';

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
    InstantTradesOldModule,
    OrderBooksOldModule
  ]
})
export class SwapsPageModule {}
