import { NgModule } from '@angular/core';
import { ProviderPanelComponent } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/provider-panel.component';
import { InstantTradeBottomFormComponent } from 'src/app/features/swaps/features/instant-trade/components/instant-trade-bottom-form/instant-trade-bottom-form.component';
import { ProvidersPanelsContainerComponent } from 'src/app/features/swaps/features/instant-trade/components/providers-panels/components/providers-panels-container/providers-panels-container.component';
import { InstantTradeService } from '@features/swaps/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TuiHintModule } from '@taiga-ui/core';
import { ProviderPanelMobileComponent } from './components/providers-panels/components/provider-panel-mobile/provider-panel-mobile.component';

@NgModule({
  declarations: [
    InstantTradeBottomFormComponent,
    ProviderPanelComponent,
    ProvidersPanelsContainerComponent,
    ProviderPanelMobileComponent
  ],
  providers: [InstantTradeService],
  exports: [InstantTradeBottomFormComponent],
  imports: [SwapsSharedModule, InlineSVGModule, TuiHintModule]
})
export class InstantTradeModule {}
