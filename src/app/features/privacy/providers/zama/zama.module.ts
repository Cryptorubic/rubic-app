import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { TuiNotification, TuiLoader, TuiButton } from '@taiga-ui/core';
import { ZamaTransferTokensPageComponent } from './components/zama-transfer-tokens-page/zama-transfer-tokens-page.component';
import { ZamaLoginPageComponent } from './components/zama-login-page/zama-login-page.component';
import { ZamaActionButtonService } from './services/zama-action-button.service';

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
    TuiLoader,
    TuiButton,
    ...TuiNotification
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    ZamaPrivateAssetsService,
    ZamaHideTokensFacadeService,
    ZamaBalanceService,
    ZamaInstanceService,
    ZamaFacadeService,
    ZamaSwapService,
    ZamaTokensService,
    ZamaSignatureService,
    ZamaRevealFacadeService,
    ZamaActionButtonService
  ]
})
export class ZamaModule {}
