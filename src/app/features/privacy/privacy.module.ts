import { PrivacyMainPageComponent } from '@features/privacy/components/privacy-main-page/privacy-main-page.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PrivacyRoutingModule } from '@features/privacy/privacy-routing.module';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiFieldErrorPipeModule,
  TuiInputModule,
  TuiInputPasswordModule,
  TuiStepperModule
} from '@taiga-ui/kit';
import { TuiButtonModule, TuiErrorModule } from '@taiga-ui/core';
import { PrivateTokensSelectorComponent } from './components/private-tokens-selector/private-tokens-selector.component';
import { AccountInfoComponent } from './components/account-info/account-info.component';
import { RailgunFormComponent } from './components/railgun-form/railgun-form.component';
import { PageNavigationComponent } from './components/page-navigation/page-navigation.component';
import { AssetsSelectorModule } from '@features/trade/components/assets-selector/assets-selector.module';
import { HideTokensPageComponent } from './components/hide-tokens-page/hide-tokens-page.component';
import { TradeModule } from '@features/trade/trade.module';
import { PrivateSwapPageComponent } from './components/private-swap-page/private-swap-page.component';
import { RevealComponent } from './components/reveal/reveal.component';
import { PublicTokensSelectorComponent } from '@features/privacy/components/public-tokens-selector/public-tokens-selector.component';

@NgModule({
  declarations: [
    PrivacyMainPageComponent,
    PrivateTokensSelectorComponent,
    AccountInfoComponent,
    RailgunFormComponent,
    PageNavigationComponent,
    HideTokensPageComponent,
    PrivateSwapPageComponent,
    RevealComponent,
    PublicTokensSelectorComponent
  ],
  imports: [
    CommonModule,
    PrivacyRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    TuiInputModule,
    TuiInputPasswordModule,
    TuiErrorModule,
    TuiFieldErrorPipeModule,
    TuiButtonModule,
    TuiStepperModule,
    AssetsSelectorModule,
    TradeModule
  ],
  providers: []
})
export class PrivacyModule {}
