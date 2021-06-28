import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwapsRoutingModule } from 'src/app/features/swaps/swaps-routing.module';
import { InstantTradeModule } from 'src/app/features/instant-trade/instant-trade.module';
import { BridgeModule } from 'src/app/features/bridge/bridge.module';
import { SharedModule } from 'src/app/shared/shared.module';
import {
  TuiDataListModule,
  TuiDropdownControllerModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { SettingsItComponent } from 'src/app/features/swaps/components/settings-it/settings-it.component';
import { SettingsContainerComponent } from 'src/app/features/swaps/components/settings-container/settings-container.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiInputModule,
  TuiInputNumberModule,
  TuiSliderModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg';
import { TokensSelectModule } from 'src/app/features/tokens-select/tokens-select.module';
import { BridgesSwapProviderService } from 'src/app/features/bridge/services/bridges-swap-provider-service/bridges-swap-provider.service';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { InstantTradesSwapProviderService } from 'src/app/features/instant-trade/services/instant-trades-swap-provider-service/instant-trades-swap-provider.service';
import { RubicBlockchainsComponent } from 'src/app/features/swaps/components/rubic-blockchains/rubic-blockchains.component';
import { RubicTokensComponent } from 'src/app/features/swaps/components/rubic-tokens/rubic-tokens.component';
import { SwapsFormComponent } from './components/swaps-form/swaps-form.component';
import { SettingsBridgeComponent } from './components/settings-bridge/settings-bridge.component';
import { RubicRefreshButtonComponent } from './components/rubic-refresh-button/rubic-refresh-button.component';

@NgModule({
  declarations: [
    SwapsFormComponent,
    SettingsContainerComponent,
    SettingsItComponent,
    SettingsBridgeComponent,
    RubicBlockchainsComponent,
    RubicTokensComponent,
    RubicRefreshButtonComponent
  ],
  exports: [RubicRefreshButtonComponent],
  imports: [
    CommonModule,
    SwapsRoutingModule,
    InstantTradeModule,
    BridgeModule,
    SharedModule,
    TuiHostedDropdownModule,
    TuiDataListModule,
    TuiSvgModule,
    TuiDropdownControllerModule,
    ReactiveFormsModule,
    TuiInputModule,
    TuiSliderModule,
    TuiToggleModule,
    TuiInputNumberModule,
    TuiTextfieldControllerModule,
    InlineSVGModule,
    TuiHintModule,
    TokensSelectModule
  ],
  entryComponents: [SettingsItComponent, SettingsBridgeComponent],
  providers: [SwapsService, InstantTradesSwapProviderService, BridgesSwapProviderService]
})
export class SwapsModule {}
