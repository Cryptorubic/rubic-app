import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProviderPanelComponent } from '@features/instant-trade/components/providers-panels/components/provider-panel/provider-panel.component';
import { InstantTradeBottomFormComponent } from './components/instant-trade-bottom-form/instant-trade-bottom-form.component';
import { ProvidersPanelsContainerComponent } from './components/providers-panels/components/providers-panels-container/providers-panels-container.component';
import { InstantTradeService } from '@features/instant-trade/services/instant-trade-service/instant-trade.service';
import { InstantTradeProvidersService } from '@features/instant-trade/services/instant-trade-service/instant-trade-providers.service';

@NgModule({
  declarations: [
    InstantTradeBottomFormComponent,
    ProviderPanelComponent,
    ProvidersPanelsContainerComponent
  ],
  providers: [InstantTradeService, InstantTradeProvidersService],
  exports: [InstantTradeBottomFormComponent],
  imports: [CommonModule, SharedModule]
})
export class InstantTradeModule {}
