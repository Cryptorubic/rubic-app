import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { ProviderPanelComponent } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/provider-panel.component';
import { InstantTradeBottomFormComponent } from 'src/app/features/swaps/features/instant-trade/components/instant-trade-bottom-form/instant-trade-bottom-form.component';
import { ProvidersPanelsContainerComponent } from 'src/app/features/swaps/features/instant-trade/components/providers-panels/components/providers-panels-container/providers-panels-container.component';
import { InstantTradeService } from '@features/swaps/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { InstantTradeProvidersService } from '@features/swaps/features/instant-trade/services/instant-trade-service/instant-trade-providers.service';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { PanelContentComponent } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/panel-content/panel-content.component';
import { PanelErrorContentComponent } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/panel-error-content/panel-error-content.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TuiHintModule } from '@taiga-ui/core';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@NgModule({
  declarations: [
    InstantTradeBottomFormComponent,
    ProviderPanelComponent,
    ProvidersPanelsContainerComponent,
    PanelContentComponent,
    PanelErrorContentComponent
  ],
  exports: [InstantTradeBottomFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    SwapsSharedModule,
    SwapsCoreModule,
    InlineSVGModule,
    TuiHintModule
  ],
  providers: [InstantTradeService, InstantTradeProvidersService]
})
export class InstantTradeModule {}
