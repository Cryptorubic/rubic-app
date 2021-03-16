import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { InstantTradesComponent } from './components/instant-trades/instant-trades.component';
import { InstantTradesFormComponent } from './components/instant-trades-form/instant-trades-form.component';
import { InstantTradesTableComponent } from './components/instant-trades-table/instant-trades-table.component';
import { TradesModule } from '../trades-module/trades.module';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [InstantTradesComponent, InstantTradesFormComponent, InstantTradesTableComponent],
  imports: [CommonModule, TradesModule, SharedModule],
  exports: [InstantTradesComponent],
  providers: [
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
export class InstantTradesModule {}
