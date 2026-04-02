import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HinkalRoutingModule } from './hinkal-routing.module';
import { HinkalViewComponent } from './components/hinkal-view/hinkal-view.component';
import { HinkalInstanceService } from './services/hinkal-sdk/hinkal-instance.service';
import { HinkalBalanceService } from './services/hinkal-sdk/hinkal-balance.service';
import { HinkalSwapService } from './services/hinkal-sdk/hinkal-swap.service';
import { HinkalHideTokensPageComponent } from './components/hinkal-hide-tokens-page/hinkal-hide-tokens-page.component';
import { SharedPrivacyProvidersModule } from '../shared-privacy-providers/shared-privacy-providers.module';
import { HinkalRevealTokensPageComponent } from './components/hinkal-reveal-tokens-page/hinkal-reveal-tokens-page.component';
import { HinkalPrivateAssetsService } from './services/hinkal-private-assets.service';
import { HinkalFacadeService } from './services/hinkal-sdk/hinkal-facade.service';
import { SharedModule } from '@app/shared/shared.module';
import { HinkalTransferTokensPageComponent } from './components/hinkal-transfer-tokens-page/hinkal-transfer-tokens-page.component';
import { HinkalSwapTokensPageComponent } from './components/hinkal-swap-tokens-page/hinkal-swap-tokens-page.component';
import { HinkalWalletInfoComponent } from './components/hinkal-wallet-info/hinkal-wallet-info.component';
import { TuiButtonModule, TuiNotificationModule } from '@taiga-ui/core';
import { HinkalWorkerService } from './services/hinkal-sdk/hinkal-worker.service';
import { HinkalLoginPageComponent } from './components/hinkal-login-page/hinkal-login-page.component';
import { HinkalActionButtonService } from './services/hinkal-action-button.service';
import { HinkalToPrivateAssetsService } from './services/hinkal-to-assets.service';
import { HinkalRevealFacadeService } from './services/token-facades/hinkal-reveal-facade.service';
import { HinkalSwapTokensFacadeService } from './services/token-facades/hinkal-swap-tokens-facade.service';
import { HinkalHideFacadeService } from './services/token-facades/hinkal-hide-facade.service';

@NgModule({
  declarations: [
    HinkalViewComponent,
    HinkalHideTokensPageComponent,
    HinkalRevealTokensPageComponent,
    HinkalTransferTokensPageComponent,
    HinkalSwapTokensPageComponent,
    HinkalWalletInfoComponent,
    HinkalLoginPageComponent
  ],
  imports: [
    CommonModule,
    HinkalRoutingModule,
    SharedPrivacyProvidersModule,
    SharedModule,
    TuiButtonModule,
    TuiNotificationModule
  ],
  providers: [
    HinkalInstanceService,
    HinkalBalanceService,
    HinkalSwapService,
    HinkalRevealFacadeService,
    HinkalPrivateAssetsService,
    HinkalFacadeService,
    HinkalSwapTokensFacadeService,
    HinkalWorkerService,
    HinkalActionButtonService,
    HinkalToPrivateAssetsService,
    HinkalHideFacadeService
  ]
})
export class HinkalModule {}
