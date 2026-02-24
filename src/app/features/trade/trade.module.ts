import { NgModule } from '@angular/core';
import { TradeViewContainerComponent } from '@features/trade/components/trade-view-container/trade-view-container.component';
import { TradeRoutingModule } from '@features/trade/trade-routing.module';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { ProvidersListGeneralComponent } from '@features/trade/components/providers-list-general/providers-list-general.component';
import { ProviderElementComponent } from './components/provider-element/provider-element.component';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { CrossChainService } from '@features/trade/services/cross-chain/cross-chain.service';
import { OnChainService } from '@features/trade/services/on-chain/on-chain.service';
import { CrossChainApiService } from '@features/trade/services/cross-chain-routing-api/cross-chain-api.service';
import {
  TuiButtonModule,
  TuiExpandModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiNotificationModule,
  TuiModeModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import {
  TuiCarouselModule,
  TuiInputModule,
  TuiInputNumberModule,
  TuiTagModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { PreviewSwapComponent } from './components/preview-swap/preview-swap.component';
import { ActionButtonComponent } from './components/action-button/action-button.component';
import { ReceiverAddressButtonComponent } from './components/receiver-address-button/receiver-address-button.component';
import { SwapDataElementComponent } from './components/swap-data-element/swap-data-element.component';
import { TransactionDetailsComponent } from './components/transaction-details/transaction-details.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { RouteElementComponent } from './components/route-element/route-element.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { SettingsItComponent } from '@features/trade/components/settings-it/settings-it.component';
import { SettingsCcrComponent } from '@features/trade/components/settings-ccr/settings-ccr.component';
import { SettingsContainerComponent } from '@features/trade/components/settings-container/settings-container.component';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { TokenSelectorPageComponent } from './components/token-selector-page/token-selector-page.component';
import { SwapFormPageComponent } from './components/swap-form-page/swap-form-page.component';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { TransactionStateComponent } from './components/transaction-state/transaction-state.component';
import { OnChainApiService } from '@features/trade/services/on-chain-api/on-chain-api.service';
import { SuccessSwapInfoComponent } from './components/success-swap-info/success-swap-info.component';
import { RefreshService } from '@features/trade/services/refresh-service/refresh.service';
import { AssetsSelectorModule } from '@features/trade/components/assets-selector/assets-selector.module';
import { TransactionDetailsElementComponent } from '@features/trade/components/swap-info/components/transaction-details-element/transaction-details-element.component';
import { UserBalanceContainerComponent } from '@features/trade/components/user-balance-container/user-balance-container.component';
import { FormSwitcherComponent } from '@features/trade/components/form-switcher/form-switcher.component';
import { TargetNetworkAddressComponent } from '@features/trade/components/target-network-address/target-network-address.component';
import { TokensRateComponent } from '@features/trade/components/tokens-rate/tokens-rate.component';
import { SettingsWarningModalComponent } from '@features/trade/components/settings-warning-modal/settings-warning-modal.component';
import { ProvidersListComponent } from '@features/trade/components/providers-list/providers-list.component';
import { MevBotComponent } from './components/mev-bot/mev-bot.component';
import { PromotionBadgeComponent } from './components/provider-element/promotion-badge/promotion-badge.component';
import { ActionButtonService } from '@features/trade/services/action-button-service/action-button.service';
import { FormHeaderComponent } from './components/form-header/form-header.component';
import { FormsTogglerService } from './services/forms-toggler/forms-toggler.service';
import { TradeInfoManager } from './services/trade-info-manager/trade-info-manager.service';
import { DepositService } from './services/deposit/deposit.service';
import { DepositPreviewSwapComponent } from './components/deposit-preview-swap/deposit-preview-swap.component';
import { DepositTradeInfoComponent } from './components/deposit-trade-info/deposit-trade-info.component';
import { AlternativeRoutesService } from './services/alternative-route-api-service/alternative-routes.service';
import { AlternativeRouteElementComponent } from './components/alternative-route-element/alternative-route-element.component';
import { AlternativeRoutesListComponent } from './components/alternative-routes-list/alternative-routes-list.component';
import { RefundService } from './services/refund-service/refund.service';
import { RefundAddressComponent } from './components/refund-address/refund-address.component';
import { CryptoRateChartComponent } from './components/crypto-rate-chart/crypto-rate-chart.component';
import { SolanaGaslessService } from './services/solana-gasless/solana-gasless.service';
import { SolanaGaslessStateService } from './services/solana-gasless/solana-gasless-state.service';
import { SwapRetryPendingModalComponent } from './components/swap-retry-pending-modal/swap-retry-pending-modal.component';
import { SwapBackupRateChangedModalComponent } from './components/swap-backup-rate-changed-modal/swap-backup-rate-changed-modal.component';
import { AllSwapBackupsFailedModalComponent } from './components/all-swap-backups-failed-modal/all-swap-backups-failed-modal.component';
import { TurnstileCheckComponent } from './components/turnstile-check/turnstile-check.component';

@NgModule({
  declarations: [
    TradeViewContainerComponent,
    ProvidersListGeneralComponent,
    ProviderElementComponent,
    PreviewSwapComponent,
    ActionButtonComponent,
    ReceiverAddressButtonComponent,
    SwapDataElementComponent,
    TransactionDetailsComponent,
    RouteElementComponent,
    SettingsContainerComponent,
    SettingsItComponent,
    SettingsCcrComponent,
    TokenSelectorPageComponent,
    SwapFormPageComponent,
    TransactionStateComponent,
    SuccessSwapInfoComponent,
    TransactionDetailsElementComponent,
    UserBalanceContainerComponent,
    FormSwitcherComponent,
    TargetNetworkAddressComponent,
    TokensRateComponent,
    SettingsWarningModalComponent,
    ProvidersListComponent,
    DepositPreviewSwapComponent,
    DepositTradeInfoComponent,
    MevBotComponent,
    PromotionBadgeComponent,
    FormHeaderComponent,
    AlternativeRouteElementComponent,
    AlternativeRoutesListComponent,
    RefundAddressComponent,
    CryptoRateChartComponent,
    SwapRetryPendingModalComponent,
    SwapBackupRateChangedModalComponent,
    AllSwapBackupsFailedModalComponent,
    TurnstileCheckComponent
  ],
  exports: [
    ActionButtonComponent,
    TokenSelectorPageComponent,
    ProvidersListGeneralComponent,
    SwapFormPageComponent
  ],
  imports: [
    TradeRoutingModule,
    CommonModule,
    SharedModule,
    TuiExpandModule,
    TuiScrollbarModule,
    TuiTagModule,
    InlineSVGModule,
    TuiButtonModule,
    ClipboardModule,
    ReactiveFormsModule,
    TuiHintModule,
    FormsModule,
    TuiTextfieldControllerModule,
    TuiInputNumberModule,
    TuiToggleModule,
    TuiHostedDropdownModule,
    TuiInputModule,
    TuiLoaderModule,
    AssetsSelectorModule,
    TuiNotificationModule,
    TuiModeModule,
    TuiCarouselModule
    // SwapsRoutingModule,
    // SwapsSharedModule,
    // InstantTradeModule,
    // CrossChainModule,
    // OnramperExchangerModule,
    // LimitOrderModule,
    // TuiHostedDropdownModule,
    // TuiDataListModule,
    // TuiSvgModule,
    // TuiDropdownModule,
    // ReactiveFormsModule,
    // TuiInputModule,
    // TuiSliderModule,
    // TuiToggleModule,
    // TuiInputNumberModule,
    // TuiTextfieldControllerModule,
    // InlineSVGModule,
    // TuiHintModule,
    // AssetsSelectorModule,
    // FormsModule,
    // TuiLoaderModule,
    // ClipboardModule,
    // TuiAccordionModule,
    // TuiHintModule
  ],
  providers: [
    SwapsStateService,
    SwapsControllerService,
    SwapFormQueryService,
    CrossChainService,
    OnChainService,
    CrossChainApiService,
    SettingsService,
    TargetNetworkAddressService,
    RefreshService,
    PreviewSwapService,
    OnChainApiService,
    DepositService,
    ActionButtonService,
    FormsTogglerService,
    TradeInfoManager,
    FormsTogglerService,
    AlternativeRoutesService,
    RefundService,
    SolanaGaslessService,
    SolanaGaslessStateService
  ]
})
export class TradeModule {}
