import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  TuiToggleModule,
  TuiInputModule,
  TuiTabsModule,
  TuiInputCountModule,
  TuiDataListWrapperModule,
  TuiBadgeModule,
  TuiTagModule
} from '@taiga-ui/kit';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDropdownModule,
  TuiHintModule,
  TuiSvgModule,
  TuiTooltipModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiManualHintModule,
  TuiTextfieldControllerModule,
  TuiScrollbarModule
} from '@taiga-ui/core';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { RubicLanguageSelectComponent } from 'src/app/core/header/components/header/components/rubic-language-select/rubic-language-select.component';
import { GasIndicatorComponent } from 'src/app/shared/components/gas-indicator/gas-indicator.component';
import { LetDirective } from 'src/app/shared/directives/let/let.directive';
import { NoFrameDirective } from 'src/app/shared/directives/noFrame/no-frame.directive';
import { OnlyFrameDirective } from 'src/app/shared/directives/onlyFrame/only-frame.directive';
import { UsdPriceContainerComponent } from 'src/app/shared/components/usd-price-container/usd-price-container.component';
import { PanelErrorContentComponent } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/panel-error-content/panel-error-content.component';
import { PanelContentComponent } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/panel-content/panel-content.component';
import { BigNumberFormatPipe } from './pipes/big-number-format.pipe';
import { ScannerLinkPipe } from './pipes/scanner-link.pipe';
import { SafetyLinkDirective } from './directives/safety-link/safety-link.directive';
import { ShortAddressPipe } from './pipes/short-address.pipe';
import { WithRoundPipe } from './pipes/with-round.pipe';
import { IconButtonComponent } from './components/buttons/icon-button/icon-button.component';
import { DropdownSelectorComponent } from './components/dropdown-selector/dropdown-selector.component';
import { TokenAmountDirective } from './directives/token-amount/token-amount.directive';
import { RubicButtonCircleComponent } from './components/rubic-button-circle/rubic-button-circle.component';
import { RubicButtonComponent } from './components/rubic-button/rubic-button.component';
import { ShortenAmountPipe } from './pipes/shorten-amount.pipe';
import { RubicVolumeComponent } from './components/rubic-volume/rubic-volume.component';
import { IframeAssetTypeIndicatorComponent } from 'src/app/shared/components/iframe-asset-type-indicator/iframe-asset-type-indicator.component';
import { ThemedIconPipe } from './pipes/themed-icon.pipe';
import { SuccessTxModalComponent } from 'src/app/shared/components/success-modal/success-tx-modal/success-tx-modal.component';
import { SuccessTrxNotificationComponent } from './components/success-trx-notification/success-trx-notification.component';
import { RotatingIconComponent } from './components/rotating-icon/rotating-icon.component';
import { InfoHintComponent } from './components/info-hint/info-hint.component';
import { BuyTokenComponent } from './components/buy-token/buy-token.component';
import { NotificationBadgeComponent } from './components/notification-badge/notification-badge.component';
import { FalsyPipe } from './pipes/falsy.pipe';
import { RubicContainerComponent } from './components/rubic-container/rubic-container.component';
import { CopyContainerComponent } from './components/copy-container/copy-container.component';
import { FunctionCallPipe } from '@shared/pipes/function-call.pipe';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { ChipsComponent } from './components/chips/chips.component';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { SymbiosisWarningTxModalComponent } from './components/symbiosis-warning-tx-modal/symbiosis-warning-tx-modal.component';
import { IframeLogoutButtonComponent } from '@shared/components/iframe-logout-button/iframe-logout-button.component';
import { TimeGuard } from './guards/time.guard';
import { AutoSlippageWarningModalComponent } from '@shared/components/via-slippage-warning-modal/auto-slippage-warning-modal.component';
import { SafeSanitizerPipe } from '@shared/pipes/safeSanitizer.pipe';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { SuccessOrderModalComponent } from './components/success-modal/success-order-modal/success-order-modal.component';
import { RefreshButtonComponent } from '@shared/components/refresh-button/refresh-button.component';
import { LoginButtonComponent } from '@core/header/components/header/components/login-button/login-button.component';
import { CommaToPeriodDirective } from './directives/comma-to-period/comma-to-period.directive';
import { RecentCrossChainTableTxComponent } from '@shared/components/recent-cross-chain-table/recent-cross-chain-table.component';
import { TradeRowComponent } from '@shared/components/recent-cross-chain-table/trade-row/trade-row.component';
import { SwapAndEarnModalComponent } from '@shared/components/success-modal/swap-and-earn-modal/swap-and-earn-modal.component';
import { SuccessWithdrawModalComponent } from '@shared/components/success-modal/success-withdraw-modal/success-withdraw-modal.component';
import { ArbitrumBridgeWarningModalComponent } from './components/arbitrum-bridge-warning-modal/arbitrum-bridge-warning-modal.component';
import { LiveChatComponent } from './components/live-chat/live-chat.component';

@NgModule({
  declarations: [
    // Components.
    DropdownSelectorComponent,
    RubicButtonCircleComponent,
    RubicButtonCircleComponent,
    RubicButtonComponent,
    IconButtonComponent,
    RubicLanguageSelectComponent,
    RubicVolumeComponent,
    SuccessTxModalComponent,
    SuccessTrxNotificationComponent,
    GasIndicatorComponent,
    PanelErrorContentComponent,
    PanelContentComponent,
    UsdPriceContainerComponent,
    RotatingIconComponent,
    InfoHintComponent,
    BuyTokenComponent,
    IframeAssetTypeIndicatorComponent,
    RubicContainerComponent,
    RotatingIconComponent,
    InfoHintComponent,
    NotificationBadgeComponent,
    CopyContainerComponent,
    StatusBadgeComponent,
    ChipsComponent,
    ProgressTrxNotificationComponent,
    SymbiosisWarningTxModalComponent,
    IframeLogoutButtonComponent,
    AutoSlippageWarningModalComponent,
    BackButtonComponent,
    LoginButtonComponent,
    RefreshButtonComponent,
    SuccessOrderModalComponent,
    RecentCrossChainTableTxComponent,
    TradeRowComponent,
    SwapAndEarnModalComponent,
    SuccessWithdrawModalComponent,
    ArbitrumBridgeWarningModalComponent,
    // Pipes.
    BigNumberFormatPipe,
    ScannerLinkPipe,
    ShortAddressPipe,
    WithRoundPipe,
    ShortenAmountPipe,
    ThemedIconPipe,
    FalsyPipe,
    FunctionCallPipe,
    SafeSanitizerPipe,
    // Directives.
    SafetyLinkDirective,
    TokenAmountDirective,
    LetDirective,
    NoFrameDirective,
    OnlyFrameDirective,
    CommaToPeriodDirective,
    LiveChatComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ScrollingModule,
    InlineSVGModule.forRoot(),
    TuiSvgModule,
    TuiTooltipModule,
    TuiHintModule,
    TuiInputModule,
    TuiButtonModule,
    TuiDataListModule,
    TuiActiveZoneModule,
    TuiDropdownModule,
    TuiHostedDropdownModule,
    TuiToggleModule,
    TuiSvgModule,
    TuiHintModule,
    TuiToggleModule,
    TuiTabsModule,
    TuiInputCountModule,
    TuiDataListWrapperModule,
    TuiLoaderModule,
    TuiBadgeModule,
    TuiManualHintModule,
    TuiTagModule,
    TuiTextfieldControllerModule,
    TuiScrollbarModule
  ],
  exports: [
    BigNumberFormatPipe,
    ScannerLinkPipe,
    TranslateModule,
    ShortAddressPipe,
    RubicButtonCircleComponent,
    DropdownSelectorComponent,
    RubicButtonCircleComponent,
    RubicButtonComponent,
    IconButtonComponent,
    ShortenAmountPipe,
    RubicLanguageSelectComponent,
    RubicVolumeComponent,
    FalsyPipe,
    WithRoundPipe,
    SafetyLinkDirective,
    TokenAmountDirective,
    GasIndicatorComponent,
    PanelErrorContentComponent,
    PanelContentComponent,
    LetDirective,
    NoFrameDirective,
    OnlyFrameDirective,
    IframeAssetTypeIndicatorComponent,
    ThemedIconPipe,
    UsdPriceContainerComponent,
    RotatingIconComponent,
    InfoHintComponent,
    BuyTokenComponent,
    NotificationBadgeComponent,
    RubicContainerComponent,
    CopyContainerComponent,
    FunctionCallPipe,
    StatusBadgeComponent,
    ChipsComponent,
    IframeLogoutButtonComponent,
    SafeSanitizerPipe,
    BackButtonComponent,
    RefreshButtonComponent,
    LoginButtonComponent,
    RecentCrossChainTableTxComponent,
    TradeRowComponent,
    CommaToPeriodDirective,
    SwapAndEarnModalComponent,
    SuccessWithdrawModalComponent,
    LiveChatComponent
  ],
  providers: [ScannerLinkPipe, WithRoundPipe, BigNumberFormatPipe, TimeGuard, SafeSanitizerPipe]
})
export class SharedModule {}
