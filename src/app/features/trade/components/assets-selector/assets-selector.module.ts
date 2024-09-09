import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDropdownModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiScrollbarModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { TuiDataListDropdownManagerModule, TuiInputModule } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SharedModule } from '@shared/shared.module';
import { TuiActiveZoneModule, TuiAutoFocusModule } from '@taiga-ui/cdk';
import { EmptyListComponent } from './components/tokens-list/components/empty-list/empty-list.component';
import { AssetTypesAsideComponent } from '@features/trade/components/assets-selector/components/asset-types-aside/asset-types-aside.component';
import { SearchBarComponent } from '@features/trade/components/assets-selector/components/search-bar/search-bar.component';
import { TokensListComponent } from '@features/trade/components/assets-selector/components/tokens-list/tokens-list.component';
import { TokensListElementComponent } from '@features/trade/components/assets-selector/components/tokens-list/components/tokens-list-element/tokens-list-element.component';
import { CustomTokenComponent } from '@features/trade/components/assets-selector/components/tokens-list/components/custom-token/custom-token.component';
import { CustomTokenWarningModalComponent } from '@features/trade/components/assets-selector/components/tokens-list/components/custom-token-warning-modal/custom-token-warning-modal.component';
import { BlockchainsListComponent } from '@features/trade/components/assets-selector/components/blockchains-list/blockchains-list.component';
import { SwitchTokensListTypeButtonComponent } from '@features/trade/components/assets-selector/components/switch-tokens-list-type-button/switch-tokens-list-type-button.component';
import { AssetsSelectorPageComponent } from '@features/trade/components/assets-selector/components/assets-selector-page/assets-selector-page.component';
import { TradePageService } from '../../services/trade-page/trade-page.service';
import { BlockchainsListService } from './services/blockchains-list-service/blockchains-list.service';
import { SearchQueryService } from './services/search-query-service/search-query.service';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';
import { AssetsSelectorService } from './services/assets-selector-service/assets-selector.service';
import { BlockchainsFilterListComponent } from './components/blockchains-filter-list/blockchains-filter-list.component';
import { FilterListElementComponent } from './components/blockchains-filter-list/components/filter-list-element/filter-list-element.component';
import { FilterQueryService } from './services/filter-query-service/filter-query.service';
import { BlockchainsPromoBadgeComponent } from './components/blockchains-promo-badge/blockchains-promo-badge.component';
import { AssetsSearchQueryService } from './services/assets-search-query-service/assets-search-query.service';

@NgModule({
  declarations: [
    AssetTypesAsideComponent,
    SearchBarComponent,
    TokensListComponent,
    TokensListElementComponent,
    CustomTokenComponent,
    CustomTokenWarningModalComponent,
    BlockchainsListComponent,
    SwitchTokensListTypeButtonComponent,
    EmptyListComponent,
    AssetsSelectorPageComponent,
    BlockchainsFilterListComponent,
    FilterListElementComponent,
    BlockchainsPromoBadgeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TuiScrollbarModule,
    TuiInputModule,
    FormsModule,
    TuiTextfieldControllerModule,
    TuiSvgModule,
    TuiButtonModule,
    ScrollingModule,
    TuiHintModule,
    TuiHintModule,
    TuiLoaderModule,
    InlineSVGModule,
    TuiAutoFocusModule,
    TuiHostedDropdownModule,
    TuiDataListDropdownManagerModule,
    TuiActiveZoneModule,
    TuiDropdownModule,
    TuiDataListModule
  ],
  exports: [AssetsSelectorPageComponent],
  providers: [
    TradePageService,
    BlockchainsListService,
    SearchQueryService,
    FormsTogglerService,
    AssetsSelectorService,
    FilterQueryService,
    AssetsSearchQueryService
  ]
})
export class AssetsSelectorModule {}
