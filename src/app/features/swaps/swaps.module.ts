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
  TuiLoaderModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { SettingsItComponent } from 'src/app/features/swaps/components/swaps-settings/settings-it/settings-it.component';
import { SettingsContainerComponent } from 'src/app/features/swaps/components/swaps-settings/settings-container/settings-container.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TuiInputModule,
  TuiInputNumberModule,
  TuiSliderModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg';
import { TokensSelectModule } from 'src/app/features/tokens-select/tokens-select.module';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { CrossChainRoutingModule } from 'src/app/features/cross-chain-routing/cross-chain-routing.module';
import { TokenAmountInputComponent } from 'src/app/features/swaps/components/amount-input/components/token-amount-input/token-amount-input.component';
import { UsdPriceContainerComponent } from 'src/app/features/swaps/components/amount-input/components/usd-price-container/usd-price-container.component';
import { UserBalanceContainerComponent } from 'src/app/features/swaps/components/amount-input/components/user-balance-container/user-balance-container.component';
import { SuccessTxModalService } from 'src/app/features/swaps/services/success-tx-modal-service/success-tx-modal.service';
import { VerticalIframeTokenAmountInputComponent } from 'src/app/features/swaps/components/amount-input/components/vertical-iframe-token-amount-input/vertical-iframe-token-amount-input.component';
import { CrossChainSwapInfoComponent } from 'src/app/features/swaps/components/swap-info/cross-chain-swap-info/cross-chain-swap-info.component';
import { SwapsFormComponent } from './components/swaps-form/swaps-form.component';
import { SettingsBridgeComponent } from './components/swaps-settings/settings-bridge/settings-bridge.component';
import { SettingsCcrComponent } from './components/swaps-settings/settings-ccr/settings-ccr.component';
import { IframeSettingsComponent } from './components/swaps-settings/iframe-settings/iframe-settings.component';

@NgModule({
  declarations: [
    SwapsFormComponent,
    SettingsContainerComponent,
    SettingsItComponent,
    SettingsBridgeComponent,
    SettingsCcrComponent,
    TokenAmountInputComponent,
    UsdPriceContainerComponent,
    UserBalanceContainerComponent,
    CrossChainSwapInfoComponent,
    IframeSettingsComponent,
    VerticalIframeTokenAmountInputComponent
  ],
  exports: [],
  imports: [
    CommonModule,
    SharedModule,
    SwapsRoutingModule,
    InstantTradeModule,
    BridgeModule,
    CrossChainRoutingModule,
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
    TokensSelectModule,
    FormsModule,
    TuiLoaderModule
  ],
  entryComponents: [
    SettingsItComponent,
    SettingsBridgeComponent,
    SettingsCcrComponent,
    IframeSettingsComponent
  ],
  providers: [SwapsService, SuccessTxModalService]
})
export class SwapsModule {}
