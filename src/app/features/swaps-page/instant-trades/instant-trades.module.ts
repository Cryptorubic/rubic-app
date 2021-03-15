import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstantTradesComponent } from './components/instant-trades/instant-trades.component';
import { InstantTradesFormComponent } from './components/instant-trades-form/instant-trades-form.component';
import { InstantTradesTableComponent } from './components/instant-trades-table/instant-trades-table.component';
import { TradesModule } from '../trades-module/trades.module';
import { SharedModule } from '../../../shared/shared.module';
import { UniSwapService } from './services/uni-swap-service/uni-swap.service';
import { OneInchService } from './services/one-inch-service/one-inch.service';
import { BurgerSwapService } from './services/burger-swap-service/burger-swap-service';

@NgModule({
  declarations: [InstantTradesComponent, InstantTradesFormComponent, InstantTradesTableComponent],
  imports: [CommonModule, TradesModule, SharedModule],
  exports: [InstantTradesComponent],
  providers: [UniSwapService, OneInchService, BurgerSwapService]
})
export class InstantTradesModule {}
