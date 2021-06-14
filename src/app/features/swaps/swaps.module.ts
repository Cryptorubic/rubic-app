import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SwapsRoutingModule } from 'src/app/features/swaps/swaps-routing.module';
import { InstantTradeModule } from 'src/app/features/instant-trade/instant-trade.module';
import { BridgeModule } from 'src/app/features/bridge/bridge.module';
import { SwapsFormComponent } from './components/swaps-form/swaps-form.component';
import { SwapsService } from './services/swaps-service/swaps.service';

@NgModule({
  declarations: [SwapsFormComponent],
  imports: [CommonModule, SwapsRoutingModule, InstantTradeModule, BridgeModule],
  providers: [SwapsService]
})
export class SwapsModule {}
