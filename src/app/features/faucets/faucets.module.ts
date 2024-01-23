import { NgModule } from '@angular/core';
import { FaucetsPageComponent } from '@features/faucets/components/faucets-page/faucets-page.component';
import { FaucetsHeaderComponent } from '@features/faucets/components/faucets-header/faucets-header.component';
import { SharedModule } from '@shared/shared.module';
import { FaucetsRoutingModule } from '@features/faucets/faucets-routing.module';
import { CommonModule } from '@angular/common';
import { FaucetsListComponent } from '@features/faucets/components/faucets-list/faucets-list.component';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiLoaderModule,
  TuiScrollbarModule
} from '@taiga-ui/core';
import { FaucetsApiService } from '@features/faucets/services/faucets-api.service';
import { BlockchainsListService } from '@features/trade/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';

@NgModule({
  declarations: [FaucetsPageComponent, FaucetsHeaderComponent, FaucetsListComponent],
  imports: [
    CommonModule,
    FaucetsRoutingModule,
    SharedModule,
    TuiDataListModule,
    TuiScrollbarModule,
    TuiLoaderModule,
    TuiButtonModule
  ],
  exports: [],
  providers: [BlockchainsListService, AssetsSelectorService, FaucetsApiService]
})
export class FaucetsModule {}
