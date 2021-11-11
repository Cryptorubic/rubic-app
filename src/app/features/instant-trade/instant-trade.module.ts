import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProviderPanelComponent } from '@features/instant-trade/components/providers-panels/components/provider-panel/provider-panel.component';
import { InstantTradeBottomFormComponent } from './components/instant-trade-bottom-form/instant-trade-bottom-form.component';
import { ProvidersPanelsContainerComponent } from './components/providers-panels/components/providers-panels-container/providers-panels-container.component';

@NgModule({
  declarations: [
    InstantTradeBottomFormComponent,
    ProviderPanelComponent,
    ProvidersPanelsContainerComponent
  ],
  exports: [InstantTradeBottomFormComponent],
  imports: [CommonModule, SharedModule],
  providers: []
})
export class InstantTradeModule {}
