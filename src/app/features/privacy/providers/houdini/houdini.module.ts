import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiButton } from '@taiga-ui/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoudiniRoutingModule } from './houdini-routing.module';
import { HoudiniMainPageComponent } from './components/houdini-main-page/houdini-main-page.component';
import { SharedPrivacyProvidersModule } from '../shared-privacy-providers/shared-privacy-providers.module';
import { SharedModule } from '@app/shared/shared.module';
import { HoudiniPrivateAssetsService } from './services/houdini-private-assets.service';
import { HoudiniTokensFacadeService } from './services/houdini-tokens-facade.service';
import { HoudiniSwapService } from './services/houdini-swap.service';
import { HoudiniPrivateActionButtonService } from './services/houdini-private-action-button.service';
import { HoudiniErrorService } from './services/houdini-error.service';

@NgModule({
  declarations: [HoudiniMainPageComponent],
  imports: [
    CommonModule,
    HoudiniRoutingModule,
    SharedPrivacyProvidersModule,
    SharedModule,
    TuiButton
  ],
  providers: [
    HoudiniPrivateAssetsService,
    HoudiniTokensFacadeService,
    HoudiniSwapService,
    HoudiniPrivateActionButtonService,
    HoudiniErrorService
  ]
})
export class HoudiniModule {}
