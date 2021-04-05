import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { InstantTradesComponent } from './components/instant-trades/instant-trades.component';
import { InstantTradesFormComponent } from './components/instant-trades-form/instant-trades-form.component';
import { InstantTradesTableComponent } from './components/instant-trades-table/instant-trades-table.component';
import { TradesModule } from '../trades-module/trades.module';
import { SharedModule } from '../../../shared/shared.module';
import { UniSwapService } from './services/uni-swap-service/uni-swap.service';
import { BurgerSwapService } from './services/burger-swap-service/burger-swap-service';
import { OneInchEthService } from './services/one-inch-service/one-inch-eth-service/one-inch-eth.service';
import { OneInchBscService } from './services/one-inch-service/one-inch-bsc-service/one-inch-bsc.service';
import { PancakeSwapService } from './services/pancake-swap-service/pancake-swap.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [InstantTradesComponent, InstantTradesFormComponent, InstantTradesTableComponent],
  imports: [CommonModule, TradesModule, SharedModule, MatTooltipModule],
  exports: [InstantTradesComponent],
  providers: [
    {
      provide: TradeTypeService,
      useClass: TradeTypeService
    },
    {
      provide: TradeParametersService,
      useClass: TradeParametersService
    },
    UniSwapService,
    OneInchBscService,
    OneInchEthService,
    BurgerSwapService,
    PancakeSwapService
  ]
})
export class InstantTradesModule {}
