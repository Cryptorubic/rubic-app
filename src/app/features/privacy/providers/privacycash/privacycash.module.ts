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
import { PrivacyCashRevertService } from './services/privacy-cash-revert.service';
import { PrivacyCashSwapService } from './services/privacy-cash-swap.service';
import { PrivacyCashApiService } from './services/privacy-cash-api.service';
import { PrivacyCashSignatureService } from './services/privacy-cash-signature.service';
import { PrivacycashPublicAssetsService } from './services/common/privacycash-public-assets.service';
import { PrivacycashPrivateAssetsService } from './services/common/privacycash-private-assets.service';
import { PrivacycashTokensFacadeService } from './services/common/privacycash-tokens-facade.service';

@NgModule({
  declarations: [
    PrivacycashMainPageComponent,
    PrivacycashHidePageComponent,
    PrivacycashRevealPageComponent,
    PrivacycashSwapPageComponent,
    PrivacycashTransferPageComponent,
    PrivacycashRefundPageComponent
  ],
  imports: [CommonModule, PrivacyCashRoutingModule, SharedModule, SharedPrivacyProvidersModule],
  providers: [
    PrivacyCashRevertService,
    PrivacyCashSwapService,
    PrivacyCashApiService,
    PrivacyCashSignatureService,
    PrivacycashPublicAssetsService,
    PrivacycashPrivateAssetsService,
    PrivacycashTokensFacadeService
  ]
})
export class PrivacyCashModule {}
