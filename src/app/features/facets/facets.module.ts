import { NgModule } from '@angular/core';
import { FacetsPageComponent } from '@features/facets/components/facets-page/facets-page.component';
import { FacetsHeaderComponent } from '@features/facets/components/facets-header/facets-header.component';
import { SharedModule } from '@shared/shared.module';
import { FacetsRoutingModule } from '@features/facets/facets-routing.module';
import { BlockchainsListService } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { CommonModule } from '@angular/common';
import { FacetsListComponent } from './components/facets-list/facets-list.component';
import { TuiDataListModule, TuiLoaderModule, TuiScrollbarModule } from '@taiga-ui/core';

@NgModule({
  declarations: [FacetsPageComponent, FacetsHeaderComponent, FacetsListComponent],
  imports: [
    CommonModule,
    FacetsRoutingModule,
    SharedModule,
    TuiDataListModule,
    TuiScrollbarModule,
    TuiLoaderModule
  ],
  exports: [],
  providers: [BlockchainsListService, AssetsSelectorService]
})
export class FacetsModule {}
