import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwapsRoutingModule } from 'src/app/features/swaps/swaps-routing.module';
import { InstantTradeModule } from 'src/app/features/swaps/features/instant-trade/instant-trade.module';
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
import { SettingsItComponent } from 'src/app/features/swaps/features/swaps-form/components/swaps-settings/settings-it/settings-it.component';
import { SettingsContainerComponent } from 'src/app/features/swaps/features/swaps-form/components/swaps-settings/settings-container/settings-container.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TuiAccordionModule,
  TuiInputModule,
  TuiInputNumberModule,
  TuiSliderModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TokensSelectorModule } from '@features/swaps/shared/components/tokens-selector/tokens-selector.module';
import { SwapsService } from 'src/app/features/swaps/core/services/swaps-service/swaps.service';
import { CrossChainModule } from 'src/app/features/swaps/features/cross-chain/cross-chain.module';
import { TokenAmountInputComponent } from 'src/app/features/swaps/features/swaps-form/components/amount-input/components/token-amount-input/token-amount-input.component';
import { UserBalanceContainerComponent } from 'src/app/features/swaps/features/swaps-form/components/amount-input/components/user-balance-container/user-balance-container.component';
import { SuccessTxModalService } from 'src/app/features/swaps/features/swaps-form/services/success-tx-modal-service/success-tx-modal.service';
import { VerticalIframeTokenAmountInputComponent } from 'src/app/features/swaps/features/swaps-form/components/amount-input/components/vertical-iframe-token-amount-input/vertical-iframe-token-amount-input.component';
import { CrossChainSwapInfoComponent } from '@features/swaps/features/swaps-form/components/swap-info/components/cross-chain-bridge-swap-info/components/cross-chain-swap-info/cross-chain-swap-info.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CrossChainBridgeSwapInfoComponent } from '@features/swaps/features/swaps-form/components/swap-info/components/cross-chain-bridge-swap-info/cross-chain-bridge-swap-info.component';
import { PriceImpactInfoLineComponent } from 'src/app/features/swaps/features/swaps-form/components/swap-info/components/price-impact-info-line/price-impact-info-line.component';
import { SwapsFormComponent } from 'src/app/features/swaps/features/swaps-form/swaps-form.component';
import { SettingsCcrComponent } from './features/swaps-form/components/swaps-settings/settings-ccr/settings-ccr.component';
import { IframeSettingsComponent } from './features/swaps-form/components/swaps-settings/iframe-settings/iframe-settings.component';
import { SwapInfoContainerComponent } from './features/swaps-form/components/swap-info/components/swap-info-container/swap-info-container.component';
import { InstantTradeSwapInfoComponent } from './features/swaps-form/components/swap-info/components/instant-trade-swap-info/instant-trade-swap-info.component';
import { SwapsSwitcherComponent } from '@features/swaps/features/swaps-form/components/swaps-switcher/swaps-switcher.component';
import { PlatformTokensAmountComponent } from './features/swaps-form/components/platform-tokens-amount/platform-tokens-amount.component';
import { SwapsHeaderComponent } from '@features/swaps/features/swaps-form/components/swaps-header/swaps-header.component';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { RefreshButtonComponent } from '@features/swaps/features/swaps-form/components/refresh-button/refresh-button.component';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';

@NgModule({
  declarations: [
    SwapsFormComponent,
    SettingsContainerComponent,
    SettingsItComponent,
    SettingsCcrComponent,
    TokenAmountInputComponent,
    UserBalanceContainerComponent,
    CrossChainSwapInfoComponent,
    IframeSettingsComponent,
    VerticalIframeTokenAmountInputComponent,
    SwapInfoContainerComponent,
    InstantTradeSwapInfoComponent,
    CrossChainBridgeSwapInfoComponent,
    PriceImpactInfoLineComponent,
    SwapsSwitcherComponent,
    PlatformTokensAmountComponent,
    SwapsHeaderComponent,
    RefreshButtonComponent
  ],
  exports: [TokenAmountInputComponent, VerticalIframeTokenAmountInputComponent],
  imports: [
    CommonModule,
    SharedModule,
    SwapsRoutingModule,
    InstantTradeModule,
    CrossChainModule,
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
    TokensSelectorModule,
    FormsModule,
    TuiLoaderModule,
    ClipboardModule,
    TuiAccordionModule
  ],
  providers: [SwapsService, SuccessTxModalService, RubicSdkService, RefreshService, TradeService]
})
export class SwapsModule {}
