import { NgModule } from '@angular/core';
import { SwapsRoutingModule } from 'src/app/features/swaps/swaps-routing.module';
import { InstantTradeModule } from 'src/app/features/swaps/features/instant-trade/instant-trade.module';
import {
  TuiDataListModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiSvgModule,
  TuiTextfieldControllerModule,
  TuiDropdownModule
} from '@taiga-ui/core';
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
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SwapFormComponent } from '@features/swaps/features/swap-form/swap-form.component';
import { SwapInfoContainerComponent } from './features/swap-form/components/swap-info/components/swap-info-container/swap-info-container.component';
import { FormSwitcherComponent } from '@features/swaps/features/swap-form/components/form-switcher/form-switcher.component';
import { PlatformTokensAmountComponent } from './features/swap-form/components/platform-tokens-amount/platform-tokens-amount.component';
import { FormHeaderComponent } from '@features/swaps/features/swap-form/components/form-header/form-header.component';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { OnramperExchangerModule } from '@features/swaps/features/onramper-exchange/onramper-exchanger.module';
import { IframeSettingsButtonComponent } from '@core/header/components/header/components/iframe-settings-button/iframe-settings-button.component';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { LimitOrderModule } from '@features/swaps/features/limit-order/limit-order.module';
import { FormNavigationComponent } from './features/swap-form/components/form-navigation/form-navigation.component';
import { ChangenowPostFormComponent } from './features/post-form/components/changenow-post-form/changenow-post-form.component';
import { TransactionDetailsComponent } from '@features/swaps/features/swap-form/components/swap-info/components/transaction-details/transaction-details.component';
import { TransactionDetailsElementComponent } from '@features/swaps/features/swap-form/components/swap-info/components/transaction-details-element/transaction-details-element.component';
import { RubicFeeValueComponent } from '@features/swaps/features/swap-form/components/swap-info/components/info-elements/rubic-fee-value/rubic-fee-value.component';
import { ProviderFeeValueComponent } from '@features/swaps/features/swap-form/components/swap-info/components/info-elements/provider-fee-value/provider-fee-value.component';
import { PriceImpactValueComponent } from '@features/swaps/features/swap-form/components/swap-info/components/info-elements/price-impact-value/price-impact-value.component';
import { RateValueComponent } from '@features/swaps/features/swap-form/components/swap-info/components/info-elements/rate-value/rate-value.component';
import { ReceiverValueComponent } from '@features/swaps/features/swap-form/components/swap-info/components/info-elements/receiver-value/receiver-value.component';

@NgModule({
  declarations: [
    SwapFormComponent,
    SwapInfoContainerComponent,
    FormSwitcherComponent,
    PlatformTokensAmountComponent,
    FormHeaderComponent,
    IframeSettingsButtonComponent,
    FormNavigationComponent,
    ChangenowPostFormComponent,
    TransactionDetailsComponent,
    TransactionDetailsElementComponent,
    RubicFeeValueComponent,
    ProviderFeeValueComponent,
    PriceImpactValueComponent,
    RateValueComponent,
    ReceiverValueComponent
  ],
  exports: [FormSwitcherComponent],
  imports: [
    SwapsRoutingModule,
    SwapsSharedModule,
    InstantTradeModule,
    CrossChainModule,
    OnramperExchangerModule,
    LimitOrderModule,
    TuiHostedDropdownModule,
    TuiDataListModule,
    TuiSvgModule,
    TuiDropdownModule,
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
    TuiAccordionModule,
    TuiHintModule
  ],
  providers: [RefreshService, TradeService, TargetNetworkAddressService]
})
export class SwapsModule {}
