import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ZamaRoutingModule } from './zama-routing.module';
import { ZamaViewComponent } from './components/zama-view/zama-view.component';
import { SharedPrivacyProvidersModule } from '../shared-privacy-providers/shared-privacy-providers.module';
import { SharedModule } from '@app/shared/shared.module';
import { ZamaHideTokensPageComponent } from './components/zama-hide-tokens-page/zama-hide-tokens-page.component';
import { ZamaRevealTokensPageComponent } from './components/zama-reveal-tokens-page/zama-reveal-tokens-page.component';
import { ZamaPrivateAssetsService } from './services/zama-private-assets.service';
import { ZamaHideTokensFacadeService } from './services/zama-hide-tokens-facade.service';
import { ZamaBalanceService } from './services/zama-sdk/zama-balance.service';
import { ZamaInstanceService } from './services/zama-sdk/zama-instance.service';
import { ZamaFacadeService } from './services/zama-sdk/zama-facade.service';
import { ZamaSwapService } from './services/zama-sdk/zama-swap.service';
import { ZamaTokensService } from './services/zama-sdk/zama-tokens.service';
import { ZamaSignatureService } from './services/zama-sdk/zama-signature.service';
import { ZamaRevealFacadeService } from './services/zama-reveal-tokens-facade.service';
import { TuiButtonModule, TuiLoaderModule, TuiNotificationModule } from '@taiga-ui/core';
import { ZamaTransferTokensPageComponent } from './components/zama-transfer-tokens-page/zama-transfer-tokens-page.component';
import { ZamaLoginPageComponent } from './components/zama-login-page/zama-login-page.component';

@NgModule({
  declarations: [
    ZamaViewComponent,
    ZamaHideTokensPageComponent,
    ZamaRevealTokensPageComponent,
    ZamaTransferTokensPageComponent,
    ZamaLoginPageComponent
  ],
  imports: [
    CommonModule,
    ZamaRoutingModule,
    SharedPrivacyProvidersModule,
    SharedModule,
    TuiLoaderModule,
    TuiButtonModule,
    TuiNotificationModule
  ],
  providers: [
    ZamaPrivateAssetsService,
    ZamaHideTokensFacadeService,
    ZamaBalanceService,
    ZamaInstanceService,
    ZamaFacadeService,
    ZamaSwapService,
    ZamaTokensService,
    ZamaSignatureService,
    ZamaRevealFacadeService
  ]
})
export class ZamaModule {}
