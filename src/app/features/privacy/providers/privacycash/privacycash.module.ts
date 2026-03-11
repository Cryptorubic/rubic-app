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
import { PrivacycashSignatureModalComponent } from './components/privacycash-signature-modal/privacycash-signature-modal.component';
import { TuiButtonModule } from '@taiga-ui/core';
import { PrivacycashPublicTokensFacadeService } from './services/common/token-facades/privacycash-public-tokens-facade.service';
import { PrivacycashPrivateTokensFacadeService } from './services/common/token-facades/privacycash-private-tokens-facade.service';
import { PrivacycashTokensService } from './services/common/token-facades/privacycash-tokens.service';

@NgModule({
  declarations: [
    PrivacycashMainPageComponent,
    PrivacycashHidePageComponent,
    PrivacycashRevealPageComponent,
    PrivacycashSwapPageComponent,
    PrivacycashTransferPageComponent,
    PrivacycashRefundPageComponent,
    PrivacycashSignatureModalComponent
  ],
  imports: [
    CommonModule,
    PrivacyCashRoutingModule,
    SharedModule,
    TuiButtonModule,
    SharedPrivacyProvidersModule
  ],
  providers: [
    PrivacycashRefundService,
    PrivacycashSwapService,
    PrivacycashApiService,
    PrivacycashPublicAssetsService,
    PrivacycashPrivateAssetsService,
    PrivacycashPublicTokensFacadeService,
    PrivacycashPrivateTokensFacadeService,
    PrivacycashTokensService
  ]
  // exports: [PrivacycashSignatureModalComponent]
})
export class PrivacyCashModule {}
