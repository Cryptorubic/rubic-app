import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  TuiBadgeModule,
  TuiDataListWrapperModule,
  TuiInputCountModule,
  TuiInputModule,
  TuiTabsModule,
  TuiTagModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDropdownModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiScrollbarModule,
  TuiSvgModule,
  TuiTextfieldControllerModule,
  TuiTooltipModule
} from '@taiga-ui/core';
import { TuiActiveZoneModule, TuiHoveredModule } from '@taiga-ui/cdk';
import { GasIndicatorComponent } from 'src/app/shared/components/gas-indicator/gas-indicator.component';
import { LetDirective } from 'src/app/shared/directives/let/let.directive';
import { UsdPriceContainerComponent } from 'src/app/shared/components/usd-price-container/usd-price-container.component';
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
import { SymbiosisWarningTxModalComponent } from './components/symbiosis-warning-tx-modal/symbiosis-warning-tx-modal.component';
import { TimeGuard } from './guards/time.guard';
import { AutoSlippageWarningModalComponent } from '@shared/components/via-slippage-warning-modal/auto-slippage-warning-modal.component';
import { SafeSanitizerPipe } from '@shared/pipes/safeSanitizer.pipe';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { SuccessOrderModalComponent } from './components/success-modal/success-order-modal/success-order-modal.component';
import { RefreshButtonComponent } from '@shared/components/refresh-button/refresh-button.component';
import { LoginButtonComponent } from '@core/header/components/header/components/login-button/login-button.component';
import { CommaToPeriodDirective } from './directives/comma-to-period/comma-to-period.directive';
import { SwapAndEarnModalComponent } from '@shared/components/success-modal/swap-and-earn-modal/swap-and-earn-modal.component';
import { SuccessWithdrawModalComponent } from '@shared/components/success-modal/success-withdraw-modal/success-withdraw-modal.component';
import { ArbitrumBridgeWarningModalComponent } from './components/arbitrum-bridge-warning-modal/arbitrum-bridge-warning-modal.component';
import { LiveChatComponent } from './components/live-chat/live-chat.component';
import { AssetSelectorComponent } from '@shared/components/asset-selector/asset-selector.component';
import { WindowContainerComponent } from './components/window-container/window-container.component';
import { InputOutputContainerComponent } from './components/input-output-container/input-output-container.component';
import { AmountTransputComponent } from './components/amount-transput/amount-transput.component';
import { NoResultComponent } from './components/no-result/no-result.component';
import { ClaimRoundRowComponent } from '@shared/components/claim-round-row/claim-round-row.component';
import { AirdropPointsService } from '@shared/services/airdrop-points-service/airdrop-points.service';
import { AirdropPointsApiService } from '@shared/services/airdrop-points-service/airdrop-points-api.service';
import { RateChangedModalComponent } from '@shared/components/rate-changed-modal/rate-changed-modal.component';
import { NoFrameDirective } from '@shared/directives/no-frame/no-frame.directive';
import { RubicBadgeComponent } from './components/rubic-badge/rubic-badge.component';

@NgModule({
  declarations: [
    DropdownSelectorComponent,
    RubicButtonCircleComponent,
    RubicButtonCircleComponent,
    RubicButtonComponent,
    IconButtonComponent,
    RubicVolumeComponent,
    SuccessTxModalComponent,
    SuccessTrxNotificationComponent,
    GasIndicatorComponent,
    UsdPriceContainerComponent,
    RotatingIconComponent,
    InfoHintComponent,
    BuyTokenComponent,
    RubicContainerComponent,
    RotatingIconComponent,
    InfoHintComponent,
    NotificationBadgeComponent,
    CopyContainerComponent,
    StatusBadgeComponent,
    ChipsComponent,
    SymbiosisWarningTxModalComponent,
    AutoSlippageWarningModalComponent,
    BackButtonComponent,
    LoginButtonComponent,
    RefreshButtonComponent,
    SuccessOrderModalComponent,
    SwapAndEarnModalComponent,
    SuccessWithdrawModalComponent,
    ArbitrumBridgeWarningModalComponent,
    ClaimRoundRowComponent,
    BigNumberFormatPipe,
    ScannerLinkPipe,
    ShortAddressPipe,
    WithRoundPipe,
    ShortenAmountPipe,
    ThemedIconPipe,
    FalsyPipe,
    FunctionCallPipe,
    SafeSanitizerPipe,
    SafetyLinkDirective,
    TokenAmountDirective,
    LetDirective,
    CommaToPeriodDirective,
    LiveChatComponent,
    AssetSelectorComponent,
    WindowContainerComponent,
    InputOutputContainerComponent,
    AmountTransputComponent,
    NoResultComponent,
    RateChangedModalComponent,
    NoFrameDirective,
    RubicBadgeComponent
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
    TuiHintModule,
    TuiTagModule,
    TuiTextfieldControllerModule,
    TuiScrollbarModule,
    TuiHoveredModule,
    NgOptimizedImage
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
    RubicVolumeComponent,
    FalsyPipe,
    WithRoundPipe,
    SafetyLinkDirective,
    TokenAmountDirective,
    GasIndicatorComponent,
    LetDirective,
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
    SafeSanitizerPipe,
    BackButtonComponent,
    RefreshButtonComponent,
    LoginButtonComponent,
    CommaToPeriodDirective,
    SwapAndEarnModalComponent,
    SuccessWithdrawModalComponent,
    LiveChatComponent,
    AssetSelectorComponent,
    WindowContainerComponent,
    InputOutputContainerComponent,
    AmountTransputComponent,
    NoResultComponent,
    ClaimRoundRowComponent,
    RateChangedModalComponent,
    NoFrameDirective,
    RubicBadgeComponent
  ],
  providers: [
    ScannerLinkPipe,
    WithRoundPipe,
    BigNumberFormatPipe,
    TimeGuard,
    SafeSanitizerPipe,
    AirdropPointsService,
    AirdropPointsApiService
  ]
})
export class SharedModule {}
