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

@NgModule({
  declarations: [ClearswapViewComponent, ClearswapTransferTokensPageComponent],
  imports: [CommonModule, ClearswapRoutingModule, SharedPrivacyProvidersModule, SharedModule],
  providers: [ClearswapPrivateAssetsService, ClearswapTokensFacadeService, ClearswapSwapService]
})
export class ClearswapModule {}
