import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RailgunFormComponent } from '@features/privacy/providers/railgun/components/railgun-form/railgun-form.component';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiCheckboxLabeledModule,
  TuiFieldErrorPipeModule,
  TuiInputModule,
  TuiInputPasswordModule,
  TuiProgressModule,
  TuiStepperModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import {
  TuiButtonModule,
  TuiErrorModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiNotificationModule
} from '@taiga-ui/core';
import { RouterModule } from '@angular/router';
import { RailgunMainPageComponent } from '@features/privacy/providers/railgun/components/railgun-main-page/railgun-main-page.component';
import { RailgunPageNavigationComponent } from '@features/privacy/providers/railgun/components/railgun-page-navigation/railgun-page-navigation.component';
import { RailgunHideTokensPageComponent } from '@features/privacy/providers/railgun/components/railgun-hide-tokens-page/railgun-hide-tokens-page.component';
import { RailgunSwapPageComponent } from '@features/privacy/providers/railgun/components/railgun-swap-page/railgun-swap-page.component';
import { RailgunRevealPageComponent } from '@features/privacy/providers/railgun/components/railgun-reveal-page/railgun-reveal-page.component';
import { RailgunAccountInfoComponent } from '@features/privacy/providers/railgun/components/railgun-account-info/railgun-account-info.component';
import { RailgunTransferPageComponent } from '@features/privacy/providers/railgun/components/railgun-transfer-page/railgun-transfer-page.component';
import { SharedPrivacyProvidersModule } from '@features/privacy/providers/shared-privacy-providers/shared-privacy-providers.module';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { HideService } from '@features/privacy/providers/railgun/services/hide/hide.service';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';
import { PrivateSwapService } from '@features/privacy/providers/railgun/services/private-swap/private-swap.service';
import { RailgunTransferService } from '@features/privacy/providers/railgun/services/transfer/railgun-transfer.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { RailgunLoginPageComponent } from './components/railgun-login-page/railgun-login-page.component';
import { RailgunWalletImportComponent } from './components/railgun-wallet-import/railgun-wallet-import.component';
import { RailgunWalletCreateComponent } from './components/railgun-wallet-create/railgun-wallet-create.component';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { RailgunErrorService } from '@features/privacy/providers/railgun/services/common/railgun-error.service';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { RailgunWalletLoadingComponent } from './components/railgun-wallet-loading/railgun-wallet-loading.component';
import { RailgunTokensBootstrapService } from '@features/privacy/providers/railgun/services/common/railgun-tokens-bootstrap.service';
import { TokensBootstrapService } from '@core/services/tokens/tokens-bootstrap.service';

@NgModule({
  declarations: [
    RailgunMainPageComponent,
    RailgunAccountInfoComponent,
    RailgunFormComponent,
    RailgunPageNavigationComponent,
    RailgunHideTokensPageComponent,
    RailgunSwapPageComponent,
    RailgunRevealPageComponent,
    RailgunTransferPageComponent,
    RailgunLoginPageComponent,
    RailgunWalletImportComponent,
    RailgunWalletCreateComponent,
    RailgunWalletLoadingComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: RailgunMainPageComponent }]),
    SharedModule,
    ReactiveFormsModule,
    TuiInputModule,
    TuiInputPasswordModule,
    TuiErrorModule,
    TuiFieldErrorPipeModule,
    TuiButtonModule,
    TuiStepperModule,
    SharedPrivacyProvidersModule,
    TuiNotificationModule,
    TuiProgressModule,
    TuiCheckboxLabeledModule,
    TuiToggleModule,
    InlineSVGModule,
    ClipboardModule,
    TuiHintModule,
    TuiLoaderModule
  ],
  providers: [
    RailgunFacadeService,
    HideService,
    RevealService,
    PrivateSwapService,
    RailgunTransferService,
    TargetNetworkAddressService,
    TuiDestroyService,
    RailgunErrorService,
    { provide: TokensBootstrapService, useClass: RailgunTokensBootstrapService }
  ]
})
export class RailgunModule {}
