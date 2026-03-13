import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClearswapRoutingModule } from '@app/features/privacy/providers/clearswap/clearswap-routing.module';
import { SharedPrivacyProvidersModule } from '@app/features/privacy/providers/shared-privacy-providers/shared-privacy-providers.module';
import { ClearswapViewComponent } from '@app/features/privacy/providers/clearswap/components/clearswap-view/clearswap-view.component';
import { SharedModule } from '@app/shared/shared.module';
import { ClearswapTransferTokensPageComponent } from '@app/features/privacy/providers/clearswap/components/clearswap-transfer-tokens-page/clearswap-transfer-tokens-page.component';
import { ClearswapPrivateAssetsService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-assets.service';
import { ClearswapTokensFacadeService } from '@app/features/privacy/providers/clearswap/services/clearswap-tokens-facade.service';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { ClearswapSwapPageComponent } from '@app/features/privacy/providers/clearswap/components/clearswap-swap-page/clearswap-swap-page.component';
import { TuiButtonModule } from '@taiga-ui/core';
import { ClearswapPrivateActionButtonService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-action-button.service';
import { ClearswapErrorService } from '@app/features/privacy/providers/clearswap/services/clearswap-error.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@NgModule({
  declarations: [
    ClearswapViewComponent,
    ClearswapTransferTokensPageComponent,
    ClearswapSwapPageComponent
  ],
  imports: [
    CommonModule,
    ClearswapRoutingModule,
    SharedPrivacyProvidersModule,
    SharedModule,
    TuiButtonModule
  ],
  providers: [
    TuiDestroyService,
    ClearswapPrivateAssetsService,
    ClearswapTokensFacadeService,
    ClearswapSwapService,
    ClearswapPrivateActionButtonService,
    ClearswapErrorService
  ]
})
export class ClearswapModule {}
