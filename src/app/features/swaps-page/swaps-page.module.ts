import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { SwapsPageComponent } from './components/swaps-page-component/swaps-page.component';
import { TradesFormComponent } from './components/trades-form/trades-form.component';
import { TradeInProgressModalComponent } from './components/trades-form/components/trade-in-progress-modal/trade-in-progress-modal.component';
import { TradeSuccessModalComponent } from './components/trades-form/components/trade-success-modal/trade-success-modal.component';
import { InstantTradesComponent } from './components/trades-form/components/instant-trades/instant-trades.component';
import { OrderBookComponent } from './components/trades-form/components/order-book/order-book.component';
import { SwapsPageRoutingModule } from './swaps-page-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { OrderBookAdvancedOptionsComponent } from './components/trades-form/components/order-book/order-book-advanced-options/order-book-advanced-options.component';
import { TradeTypeService } from './services/trade-type-service/trade-type.service';
import { OrderBooksModule } from '../order-books/order-books.module';

@NgModule({
  declarations: [
    SwapsPageComponent,
    TradesFormComponent,
    TradeInProgressModalComponent,
    TradeSuccessModalComponent,
    InstantTradesComponent,
    OrderBookComponent,
    OrderBookAdvancedOptionsComponent
  ],
  imports: [
    CommonModule,
    SwapsPageRoutingModule,
    SharedModule,
    FormsModule,
    NgxMaterialTimepickerModule,
    MatDatepickerModule,
    MatInputModule,
    OrderBooksModule
  ],
  providers: [TradeTypeService]
})
export class SwapsPageModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [TradeTypeService]
    };
  }
}
