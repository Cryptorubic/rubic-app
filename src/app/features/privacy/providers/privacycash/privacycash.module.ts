import { TuiButton } from '@taiga-ui/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyCashRoutingModule } from './privacycash-routing.module';
import { PrivacycashMainPageComponent } from './components/privacycash-main-page/privacycash-main-page.component';
import { PrivacycashHidePageComponent } from './components/privacycash-hide-page/privacycash-hide-page.component';
import { PrivacycashRevealPageComponent } from './components/privacycash-reveal-page/privacycash-reveal-page.component';
import { PrivacycashSwapPageComponent } from './components/privacycash-swap-page/privacycash-swap-page.component';
import { PrivacycashTransferPageComponent } from './components/privacycash-transfer-page/privacycash-transfer-page.component';
import { PrivacycashRefundPageComponent } from './components/privacycash-refund-page/privacycash-refund-page.component';
import { SharedPrivacyProvidersModule } from '../shared-privacy-providers/shared-privacy-providers.module';
import { SharedModule } from '@app/shared/shared.module';
import { PrivacycashRefundService } from './services/privacy-cash-revert.service';
import { PrivacycashSwapService } from './services/privacy-cash-swap.service';
import { PrivacycashApiService } from './services/privacy-cash-api.service';
import { PrivacycashPublicAssetsService } from './services/common/assets-services/privacycash-public-assets.service';
import { PrivacycashPrivateAssetsService } from './services/common/assets-services/privacycash-private-assets.service';
import { PrivacycashSignatureWindowComponent } from './components/privacycash-signature-window/privacycash-signature-window.component';
import { PrivacycashPublicTokensFacadeService } from './services/common/token-facades/privacycash-public-tokens-facade.service';
import { PrivacycashTokensService } from './services/common/token-facades/privacycash-tokens.service';
import { EphemeralWalletTokensFacadeService } from './services/common/token-facades/ephemeral-wallet-tokens-facade.service';
import { EphemeralWalletTokensService } from './services/common/token-facades/ephemeral-wallet-tokens.service';
import { PrivacycashSignatureService } from './services/privacy-cash-signature.service';
import { PrivacycashActionButtonService } from './services/common/action-button/privacycash-action-button.service';
import { PrivacycashPrivateSwapTokensFacadeService } from './services/common/token-facades/privacycash-private-swap-tokens-facade.service';
import { PrivacycashPrivateTransferTokensFacadeService } from './services/common/token-facades/privacycash-private-transfer-tokens-facade.service';
import { PrivacycashPrivateUnshieldTokensFacadeService } from './services/common/token-facades/privacycash-private-unshield-tokens-facade.service';

@NgModule({
  declarations: [
    PrivacycashMainPageComponent,
    PrivacycashHidePageComponent,
    PrivacycashRevealPageComponent,
    PrivacycashSwapPageComponent,
    PrivacycashTransferPageComponent,
    PrivacycashRefundPageComponent,
    PrivacycashSignatureWindowComponent
  ],
  imports: [
    CommonModule,
    PrivacyCashRoutingModule,
    SharedModule,
    TuiButton,
    SharedPrivacyProvidersModule
  ],
  providers: [
    PrivacycashRefundService,
    PrivacycashSwapService,
    PrivacycashApiService,
    PrivacycashSignatureService,
    PrivacycashPublicAssetsService,
    PrivacycashPrivateAssetsService,
    PrivacycashPublicTokensFacadeService,
    PrivacycashPrivateSwapTokensFacadeService,
    PrivacycashPrivateTransferTokensFacadeService,
    PrivacycashPrivateUnshieldTokensFacadeService,
    PrivacycashTokensService,
    EphemeralWalletTokensFacadeService,
    EphemeralWalletTokensService,
    PrivacycashActionButtonService
  ]
})
export class PrivacyCashModule {}
