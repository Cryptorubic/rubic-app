import { NgModule } from '@angular/core';
import { SwapsRoutingModule } from 'src/app/features/swaps/swaps-routing.module';
import { InstantTradeModule } from 'src/app/features/swaps/features/instant-trade/instant-trade.module';
import {
  TuiDataListModule,
  TuiDropdownControllerModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { SettingsItComponent } from 'src/app/features/swaps/features/swap-form/components/swap-settings/settings-it/settings-it.component';
import { SettingsContainerComponent } from 'src/app/features/swaps/features/swap-form/components/swap-settings/settings-container/settings-container.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TuiAccordionModule,
  TuiInputModule,
  TuiInputNumberModule,
  TuiSliderModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { AssetsSelectorModule } from '@features/swaps/shared/components/assets-selector/assets-selector.module';
import { CrossChainModule } from 'src/app/features/swaps/features/cross-chain/cross-chain.module';
import { TokenAmountInputComponent } from 'src/app/features/swaps/features/swap-form/components/amount-input/components/token-amount-input/token-amount-input.component';
import { UserBalanceContainerComponent } from 'src/app/features/swaps/features/swap-form/components/amount-input/components/user-balance-container/user-balance-container.component';
import { VerticalIframeTokenAmountInputComponent } from 'src/app/features/swaps/features/swap-form/components/amount-input/components/vertical-iframe-token-amount-input/vertical-iframe-token-amount-input.component';
import { CrossChainSwapInfoComponent } from '@features/swaps/features/swap-form/components/swap-info/components/cross-chain-bridge-swap-info/components/cross-chain-swap-info/cross-chain-swap-info.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CrossChainBridgeSwapInfoComponent } from '@features/swaps/features/swap-form/components/swap-info/components/cross-chain-bridge-swap-info/cross-chain-bridge-swap-info.component';
import { PriceImpactInfoLineComponent } from 'src/app/features/swaps/features/swap-form/components/swap-info/components/price-impact-info-line/price-impact-info-line.component';
import { SwapFormComponent } from '@features/swaps/features/swap-form/swap-form.component';
import { SettingsCcrComponent } from './features/swap-form/components/swap-settings/settings-ccr/settings-ccr.component';
import { IframeSettingsComponent } from './features/swap-form/components/swap-settings/iframe-settings/iframe-settings.component';
import { SwapInfoContainerComponent } from './features/swap-form/components/swap-info/components/swap-info-container/swap-info-container.component';
import { InstantTradeSwapInfoComponent } from './features/swap-form/components/swap-info/components/instant-trade-swap-info/instant-trade-swap-info.component';
import { FormSwitcherComponent } from '@features/swaps/features/swap-form/components/form-switcher/form-switcher.component';
import { PlatformTokensAmountComponent } from './features/swap-form/components/platform-tokens-amount/platform-tokens-amount.component';
import { FormHeaderComponent } from '@features/swaps/features/swap-form/components/form-header/form-header.component';
import { RefreshButtonComponent } from '@features/swaps/features/swap-form/components/refresh-button/refresh-button.component';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { OnramperExchangerModule } from '@features/swaps/features/onramper-exchange/onramper-exchanger.module';
import { IframeSettingsButtonComponent } from '@core/header/components/header/components/iframe-settings-button/iframe-settings-button.component';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { SuccessTxModalService } from '@features/swaps/features/swap-form/services/success-tx-modal-service/success-tx-modal.service';

@NgModule({
  declarations: [
    SwapFormComponent,
    SettingsContainerComponent,
    SettingsItComponent,
    SettingsCcrComponent,
    TokenAmountInputComponent,
    UserBalanceContainerComponent,
    CrossChainSwapInfoComponent,
    VerticalIframeTokenAmountInputComponent,
    SwapInfoContainerComponent,
    InstantTradeSwapInfoComponent,
    CrossChainBridgeSwapInfoComponent,
    PriceImpactInfoLineComponent,
    FormSwitcherComponent,
    PlatformTokensAmountComponent,
    FormHeaderComponent,
    RefreshButtonComponent,
    IframeSettingsComponent,
    IframeSettingsButtonComponent
  ],
  exports: [TokenAmountInputComponent, VerticalIframeTokenAmountInputComponent],
  imports: [
    SwapsRoutingModule,
    SwapsSharedModule,
    InstantTradeModule,
    CrossChainModule,
    OnramperExchangerModule,
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
    AssetsSelectorModule,
    FormsModule,
    TuiLoaderModule,
    ClipboardModule,
    TuiAccordionModule
  ],
  providers: [
    SettingsService,
    RefreshService,
    TradeService,
    TargetNetworkAddressService,
    SuccessTxModalService
  ]
})
export class SwapsModule {}
