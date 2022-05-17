import { NgModule } from '@angular/core';
import { SwapsFormComponent } from './swaps-form.component';
import { TokenAmountInputComponent } from '@features/swaps/features/swaps-form/components/amount-input/components/token-amount-input/token-amount-input.component';
import { UserBalanceContainerComponent } from '@features/swaps/features/swaps-form/components/amount-input/components/user-balance-container/user-balance-container.component';
import { VerticalIframeTokenAmountInputComponent } from '@features/swaps/features/swaps-form/components/amount-input/components/vertical-iframe-token-amount-input/vertical-iframe-token-amount-input.component';
import { PlatformTokensAmountComponent } from '@features/swaps/features/swaps-form/components/platform-tokens-amount/platform-tokens-amount.component';
import { BridgeSwapInfoComponent } from '@features/swaps/features/swaps-form/components/swap-info/components/cross-chain-bridge-swap-info/components/bridge-swap-info/bridge-swap-info.component';
import { CrossChainSwapInfoComponent } from '@features/swaps/features/swaps-form/components/swap-info/components/cross-chain-bridge-swap-info/components/cross-chain-swap-info/cross-chain-swap-info.component';
import { CrossChainBridgeSwapInfoComponent } from '@features/swaps/features/swaps-form/components/swap-info/components/cross-chain-bridge-swap-info/cross-chain-bridge-swap-info.component';
import { InstantTradeSwapInfoComponent } from '@features/swaps/features/swaps-form/components/swap-info/components/instant-trade-swap-info/instant-trade-swap-info.component';
import { SwapInfoContainerComponent } from './components/swap-info/components/swap-info-container/swap-info-container.component';
import { PriceImpactInfoLineComponent } from '@features/swaps/features/swaps-form/components/swap-info/components/price-impact-info-line/price-impact-info-line.component';
import { SwapsHeaderComponent } from '@features/swaps/features/swaps-form/components/swaps-header/swaps-header.component';
import { IframeSettingsComponent } from '@features/swaps/features/swaps-form/components/swaps-settings/iframe-settings/iframe-settings.component';
import { SettingsBridgeComponent } from '@features/swaps/features/swaps-form/components/swaps-settings/settings-bridge/settings-bridge.component';
import { SettingsCcrComponent } from '@features/swaps/features/swaps-form/components/swaps-settings/settings-ccr/settings-ccr.component';
import { SettingsItComponent } from '@features/swaps/features/swaps-form/components/swaps-settings/settings-it/settings-it.component';
import { SettingsContainerComponent } from '@features/swaps/features/swaps-form/components/swaps-settings/settings-container/settings-container.component';
import { SwapsSwitcherComponent } from '@features/swaps/features/swaps-form/components/swaps-switcher/swaps-switcher.component';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';
import { BridgeModule } from '@features/swaps/features/bridge/bridge.module';
import { CrossChainModule } from '@features/swaps/features/cross-chain-routing/cross-chain.module';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  TuiDropdownControllerModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { TuiAccordionModule, TuiInputNumberModule, TuiToggleModule } from '@taiga-ui/kit';
import { CommonModule } from '@angular/common';
import { RefreshButtonComponent } from '@features/swaps/features/swaps-form/components/refresh-button/refresh-button.component';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@NgModule({
  declarations: [
    SwapsFormComponent,
    TokenAmountInputComponent,
    UserBalanceContainerComponent,
    VerticalIframeTokenAmountInputComponent,
    PlatformTokensAmountComponent,
    BridgeSwapInfoComponent,
    CrossChainSwapInfoComponent,
    CrossChainBridgeSwapInfoComponent,
    InstantTradeSwapInfoComponent,
    PriceImpactInfoLineComponent,
    SwapInfoContainerComponent,
    SwapsHeaderComponent,
    IframeSettingsComponent,
    SettingsBridgeComponent,
    SettingsCcrComponent,
    SettingsItComponent,
    SettingsContainerComponent,
    SwapsSwitcherComponent,
    RefreshButtonComponent
  ],
  exports: [SwapsFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    SwapsSharedModule,
    SwapsCoreModule,
    InstantTradeModule,
    BridgeModule,
    CrossChainModule,
    ReactiveFormsModule,
    InlineSVGModule,
    TuiHintModule,
    TuiInputNumberModule,
    FormsModule,
    TuiTextfieldControllerModule,
    TuiToggleModule,
    TuiHostedDropdownModule,
    TuiDropdownControllerModule,
    TuiAccordionModule,
    TuiLoaderModule,
    RouterModule,
    ClipboardModule
  ],
  entryComponents: [
    SettingsItComponent,
    SettingsBridgeComponent,
    SettingsCcrComponent,
    IframeSettingsComponent
  ],
  providers: []
})
export class SwapsFormModule {}
