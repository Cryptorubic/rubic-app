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
  TuiProgressModule,
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
import { LetDirective } from 'src/app/shared/directives/let/let.directive';
import { BigNumberFormatPipe } from './pipes/big-number-format.pipe';
import { ScannerLinkPipe } from './pipes/scanner-link.pipe';
import { SafetyLinkDirective } from './directives/safety-link/safety-link.directive';
import { ShortAddressPipe } from './pipes/short-address.pipe';
import { WithRoundPipe } from './pipes/with-round.pipe';
import { TokenAmountDirective } from './directives/token-amount/token-amount.directive';
import { RubicButtonComponent } from './components/rubic-button/rubic-button.component';
import { ShortenAmountPipe } from './pipes/shorten-amount.pipe';
import { RubicVolumeComponent } from './components/rubic-volume/rubic-volume.component';
import { SuccessTxModalComponent } from 'src/app/shared/components/success-modal/success-tx-modal/success-tx-modal.component';
import { RotatingIconComponent } from './components/rotating-icon/rotating-icon.component';
import { NotificationBadgeComponent } from './components/notification-badge/notification-badge.component';
import { CopyContainerComponent } from './components/copy-container/copy-container.component';
import { FunctionCallPipe } from '@shared/pipes/function-call.pipe';
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
import { RateChangedModalComponent } from '@shared/components/rate-changed-modal/rate-changed-modal.component';
import { NoFrameDirective } from '@shared/directives/no-frame/no-frame.directive';
import { RubicBadgeComponent } from './components/rubic-badge/rubic-badge.component';
import { GetUsdPricePipe } from './pipes/get-usd-price.pipe';
import { RubicBadgeWithCopyBtnComponent } from './components/rubic-badge-with-copy-btn/rubic-badge-with-copy-btn.component';
import { DropdownOptionsTokenComponent } from './components/dropdown-options/dropdown-options-token/dropdown-options-token.component';
import { DropdownOptionsTableItemComponent } from './components/dropdown-options/dropdown-options-table-item/dropdown-options-table-item.component';
import { SymbiosisWarningTxModalComponent } from './components/symbiosis-warning-tx-modal/symbiosis-warning-tx-modal.component';
import { PriceImpactFormatPipe } from '@shared/pipes/price-impact-format.pipe';
import { SlippageFormatPipe } from '@shared/pipes/slippage-format.pipe';
import { SkipDefaultDirective } from './directives/skip-default/skip-default.directive';
import { MevBotModalComponent } from './components/mev-bot-modal/mev-bot-modal.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';

@NgModule({
  declarations: [
    RubicButtonComponent,
    RubicVolumeComponent,
    SuccessTxModalComponent,
    RotatingIconComponent,
    RotatingIconComponent,
    NotificationBadgeComponent,
    CopyContainerComponent,
    AutoSlippageWarningModalComponent,
    SymbiosisWarningTxModalComponent,
    BackButtonComponent,
    LoginButtonComponent,
    RefreshButtonComponent,
    SuccessOrderModalComponent,
    SwapAndEarnModalComponent,
    SuccessWithdrawModalComponent,
    ArbitrumBridgeWarningModalComponent,
    BigNumberFormatPipe,
    ScannerLinkPipe,
    ShortAddressPipe,
    WithRoundPipe,
    ShortenAmountPipe,
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
    RubicBadgeComponent,
    GetUsdPricePipe,
    RubicBadgeWithCopyBtnComponent,
    DropdownOptionsTokenComponent,
    DropdownOptionsTableItemComponent,
    PriceImpactFormatPipe,
    SlippageFormatPipe,
    SkipDefaultDirective,
    MevBotModalComponent,
    ProgressBarComponent
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
    TuiProgressModule,
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
    RubicButtonComponent,
    ShortenAmountPipe,
    RubicVolumeComponent,
    WithRoundPipe,
    SafetyLinkDirective,
    TokenAmountDirective,
    LetDirective,
    RotatingIconComponent,
    NotificationBadgeComponent,
    CopyContainerComponent,
    FunctionCallPipe,
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
    RateChangedModalComponent,
    NoFrameDirective,
    RubicBadgeComponent,
    GetUsdPricePipe,
    RubicBadgeWithCopyBtnComponent,
    DropdownOptionsTokenComponent,
    DropdownOptionsTableItemComponent,
    PriceImpactFormatPipe,
    SlippageFormatPipe,
    SkipDefaultDirective,
    ProgressBarComponent
  ],
  providers: [ScannerLinkPipe, WithRoundPipe, BigNumberFormatPipe, TimeGuard, SafeSanitizerPipe]
})
export class SharedModule {}
