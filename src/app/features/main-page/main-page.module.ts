import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MainPageComponent } from './components/main-page-component/main-page.component';
import { TradesFormComponent } from './components/trades-form/trades-form.component';
import { TradeInProgressModalComponent } from './components/trades-form/components/trade-in-progress-modal/trade-in-progress-modal.component';
import { TradeSuccessModalComponent } from './components/trades-form/components/trade-success-modal/trade-success-modal.component';
import { InstantTradesComponent } from './components/trades-form/components/instant-trades/instant-trades.component';
import { OrderBookComponent } from './components/trades-form/components/order-book/order-book.component';
import { MainPageRoutingModule } from './main-page-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { OrderBookAdvancedOptionsComponent } from './components/trades-form/components/order-book/order-book-advanced-options/order-book-advanced-options.component';

@NgModule({
  declarations: [
    MainPageComponent,
    TradesFormComponent,
    TradeInProgressModalComponent,
    TradeSuccessModalComponent,
    InstantTradesComponent,
    OrderBookComponent,
    OrderBookAdvancedOptionsComponent
  ],
  imports: [
    CommonModule,
    MainPageRoutingModule,
    SharedModule,
    FormsModule,
    NgxMaterialTimepickerModule,
    MatDatepickerModule,
    MatInputModule
  ]
})
export class MainPageModule {}
