import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InlineSVGModule } from 'ng-inline-svg';
import {
  TuiToggleModule,
  TuiInputModule,
  TuiTabsModule,
  TuiInputCountModule,
  TuiDataListWrapperModule
} from '@taiga-ui/kit';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDropdownModule,
  TuiHintModule,
  TuiSvgModule,
  TuiTooltipModule,
  TuiHostedDropdownModule,
  TuiLoaderModule
} from '@taiga-ui/core';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { AmountEstimatedComponent } from 'src/app/shared/components/token-amount-estimated/token-amount-estimated.component';
import { SwapButtonComponent } from 'src/app/shared/components/buttons/approve-button/swap-button.component';
import { RubicTokensComponent } from 'src/app/shared/components/rubic-tokens/rubic-tokens.component';
import { RubicBlockchainsComponent } from 'src/app/shared/components/rubic-blockchains/rubic-blockchains.component';
import { RubicTogglerThemeComponent } from 'src/app/core/header/components/header/components/rubic-toggler-theme/rubic-toggler-theme.component';
import { RubicLanguageSelectComponent } from 'src/app/core/header/components/header/components/rubic-language-select/rubic-language-select.component';
import { RubicSelectWalletComponent } from 'src/app/core/header/components/header/components/rubic-select-wallet/rubic-select-wallet.component';
import { SwapsHeaderComponent } from 'src/app/features/swaps/components/swaps-header/swaps-header.component';
import { RubicRefreshButtonComponent } from 'src/app/shared/components/rubic-refresh-button/rubic-refresh-button.component';
import { TermsNConditionsContainerComponent } from 'src/app/shared/components/terms-n-conditions-container/terms-n-conditions-container.component';
import { GasIndicatorComponent } from 'src/app/shared/components/gas-indicator/gas-indicator.component';
import { LetDirective } from 'src/app/shared/directives/let/let.directive';
import { NoFrameDirective } from 'src/app/shared/directives/noFrame/no-frame.directive';
import { OnlyFrameDirective } from 'src/app/shared/directives/onlyFrame/only-frame.directive';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { BigNumberFormatPipe } from './pipes/big-number-format.pipe';
import { ScannerLinkPipe } from './pipes/scanner-link.pipe';
import { SafetyLinkDirective } from './directives/safety-link/safety-link.directive';
import { ShortAddressPipe } from './pipes/short-address.pipe';
import { WithRoundPipe } from './pipes/with-round.pipe';
import { IconButtonComponent } from './components/buttons/icon-button/icon-button.component';
import { DropdownSelectorComponent } from './components/dropdown-selector/dropdown-selector.component';
import { TokenAmountDirective } from './directives/token-amount/token-amount.directive';
import { ProviderPanelComponent } from './components/provider-panel/provider-panel.component';
import { RubicButtonCircleComponent } from './components/rubic-button-circle/rubic-button-circle.component';
import { RubicButtonComponent } from './components/rubic-button/rubic-button.component';
import { RubicSwitcherComponent } from './components/rubic-switcher/rubic-switcher.component';
import { ShortenAmountPipe } from './pipes/shorten-amount.pipe';
import { RubicVolumeComponent } from './components/rubic-volume/rubic-volume.component';
import { AnalyticsLinkComponent } from './components/analytics-link/analytics-link.component';
import { IframeBlockchainIndicatorComponent } from './components/iframe-blockchain-indicator/iframe-blockchain-indicator.component';
import { ThemedIconPipe } from './pipes/themed-icon.pipe';
import { SuccessTxModalComponent } from './components/success-tx-modal/success-tx-modal.component';
import { SuccessTrxNotificationComponent } from './components/success-trx-notification/success-trx-notification.component';
import { PanelErrorContentComponent } from './components/provider-panel/panel-error-content/panel-error-content.component';
import { PanelContentComponent } from './components/provider-panel/panel-content/panel-content.component';

@NgModule({
  declarations: [
    // Components.
    SpinnerComponent,
    ProviderPanelComponent,
    DropdownSelectorComponent,
    AmountEstimatedComponent,
    RubicButtonCircleComponent,
    RubicButtonCircleComponent,
    RubicButtonComponent,
    RubicSwitcherComponent,
    IconButtonComponent,
    RubicTogglerThemeComponent,
    RubicLanguageSelectComponent,
    RubicSelectWalletComponent,
    RubicVolumeComponent,
    SwapButtonComponent,
    RubicTokensComponent,
    RubicBlockchainsComponent,
    RubicRefreshButtonComponent,
    SwapsHeaderComponent,
    AnalyticsLinkComponent,
    TermsNConditionsContainerComponent,
    SuccessTxModalComponent,
    SuccessTrxNotificationComponent,
    GasIndicatorComponent,
    PanelErrorContentComponent,
    PanelContentComponent,
    // Pipes.
    BigNumberFormatPipe,
    ScannerLinkPipe,
    ShortAddressPipe,
    WithRoundPipe,
    ShortenAmountPipe,
    // Directives.
    SafetyLinkDirective,
    TokenAmountDirective,
    LetDirective,
    NoFrameDirective,
    OnlyFrameDirective,
    IframeBlockchainIndicatorComponent,
    ThemedIconPipe
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
    TuiLoaderModule
  ],
  exports: [
    SpinnerComponent,
    BigNumberFormatPipe,
    ScannerLinkPipe,
    TranslateModule,
    ShortAddressPipe,
    RubicButtonCircleComponent,
    ProviderPanelComponent,
    AmountEstimatedComponent,
    DropdownSelectorComponent,
    RubicButtonCircleComponent,
    RubicButtonComponent,
    RubicSwitcherComponent,
    RubicTogglerThemeComponent,
    IconButtonComponent,
    ShortenAmountPipe,
    RubicTogglerThemeComponent,
    RubicLanguageSelectComponent,
    RubicSelectWalletComponent,
    RubicVolumeComponent,
    SwapButtonComponent,
    WithRoundPipe,
    SafetyLinkDirective,
    RubicTokensComponent,
    RubicBlockchainsComponent,
    RubicRefreshButtonComponent,
    AnalyticsLinkComponent,
    SwapsHeaderComponent,
    TermsNConditionsContainerComponent,
    TokenAmountDirective,
    GasIndicatorComponent,
    PanelErrorContentComponent,
    PanelContentComponent,
    LetDirective,
    NoFrameDirective,
    OnlyFrameDirective,
    IframeBlockchainIndicatorComponent,
    ThemedIconPipe
  ],
  providers: [ScannerLinkPipe, WithRoundPipe],
  entryComponents: [SuccessTrxNotificationComponent]
})
export class SharedModule {}
