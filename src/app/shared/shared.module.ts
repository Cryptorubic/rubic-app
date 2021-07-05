import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicModule } from 'ng-dynamic-component';
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
import { TokenAmountInputComponent } from 'src/app/shared/components/token-amount-input/token-amount-input.component';
import { SwapButtonComponent } from 'src/app/shared/components/buttons/approve-button/swap-button.component';
import { RubicTokensComponent } from 'src/app/shared/components/rubic-tokens/rubic-tokens.component';
import { RubicBlockchainsComponent } from 'src/app/shared/components/rubic-blockchains/rubic-blockchains.component';
import { RubicTogglerThemeComponent } from 'src/app/core/header/components/header/components/rubic-toggler-theme/rubic-toggler-theme.component';
import { RubicLanguageSelectComponent } from 'src/app/core/header/components/header/components/rubic-language-select/rubic-language-select.component';
import { RubicSelectWalletComponent } from 'src/app/core/header/components/header/components/rubic-select-wallet/rubic-select-wallet.component';
import { RubicRefreshButtonComponent } from 'src/app/features/swaps/components/rubic-refresh-button/rubic-refresh-button.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { BigNumberFormat } from './pipes/big-number-format.pipe';
import { NativeUrlPipe } from './pipes/native-url.pipe';
import { ScannerLinkPipe } from './pipes/scanner-link.pipe';
import { TokenAddressDirective } from './directives/token-address/token-address.directive';
import { NumberPrecisionDirective } from './directives/number-precision/number-precision.directive';
import { ScannerLinkComponent } from './components/scanner-link/scanner-link.component';
import { WrapLinkDirective } from './directives/wrap-link/wrap-link.directive';
import { SafetyLinkDirective } from './directives/safety-link/safety-link.directive';
import { ShortAddressPipe } from './pipes/short-address.pipe';
import { WithRoundPipe } from './pipes/with-round.pipe';
import { RoundPipe } from './pipes/round.pipe';
import { IconButtonComponent } from './components/buttons/icon-button/icon-button.component';
import { CrossButtonComponent } from './components/buttons/cross-button/cross-button.component';
import { DropdownSelectorComponent } from './components/dropdown-selector/dropdown-selector.component';
import { TokenAmountDirective } from './directives/token-amount/token-amount.directive';
import { ProviderPanelComponent } from './components/provider-panel/provider-panel.component';
import { RubicButtonCircleComponent } from './components/rubic-button-circle/rubic-button-circle.component';
import { RubicButtonComponent } from './components/rubic-button/rubic-button.component';
import { RubicSwitcherComponent } from './components/rubic-switcher/rubic-switcher.component';
import { ShortenAmountPipe } from './pipes/shorten-amount.pipe';
import { RubicVolumeComponent } from './components/rubic-volume/rubic-volume.component';
import { RubicBannerComponent } from './components/rubic-banner/rubic-banner.component';

@NgModule({
  declarations: [
    // Components.
    SpinnerComponent,
    ScannerLinkComponent,
    ProviderPanelComponent,
    DropdownSelectorComponent,
    TokenAmountInputComponent,
    ProviderPanelComponent,
    AmountEstimatedComponent,
    RubicButtonCircleComponent,
    RubicButtonCircleComponent,
    RubicButtonComponent,
    RubicSwitcherComponent,
    IconButtonComponent,
    CrossButtonComponent,
    RubicTogglerThemeComponent,
    RubicLanguageSelectComponent,
    RubicSelectWalletComponent,
    RubicVolumeComponent,
    RubicBannerComponent,
    SwapButtonComponent,
    RubicBannerComponent,
    RubicTokensComponent,
    RubicBlockchainsComponent,
    RubicRefreshButtonComponent,
    // Pipes.
    BigNumberFormat,
    ScannerLinkPipe,
    NativeUrlPipe,
    ShortAddressPipe,
    WithRoundPipe,
    RoundPipe,
    ShortenAmountPipe,
    // Directives.
    TokenAddressDirective,
    TokenAddressDirective,
    NumberPrecisionDirective,
    WrapLinkDirective,
    SafetyLinkDirective,
    TokenAmountDirective
  ],
  imports: [
    CommonModule,
    TranslateModule,
    DynamicModule,
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
    BigNumberFormat,
    ScannerLinkPipe,
    NativeUrlPipe,
    TokenAddressDirective,
    TranslateModule,
    NumberPrecisionDirective,
    ScannerLinkComponent,
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
    CrossButtonComponent,
    RoundPipe,
    ShortenAmountPipe,
    RubicTogglerThemeComponent,
    RubicLanguageSelectComponent,
    RubicSelectWalletComponent,
    RubicVolumeComponent,
    TokenAmountInputComponent,
    RubicBannerComponent,
    SwapButtonComponent,
    WithRoundPipe,
    SafetyLinkDirective,
    RubicTokensComponent,
    RubicBlockchainsComponent,
    RubicRefreshButtonComponent
  ],
  providers: [ScannerLinkPipe, WithRoundPipe]
})
export class SharedModule {}
