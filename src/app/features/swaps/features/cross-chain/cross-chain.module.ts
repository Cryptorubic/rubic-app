import { NgModule } from '@angular/core';
import { CrossChainBottomFormComponent } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/cross-chain-bottom-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiScrollbarModule,
  TuiSvgModule,
  TuiTextfieldControllerModule,
  TuiDropdownModule
} from '@taiga-ui/core';
import { TuiAccordionModule, TuiBadgeModule, TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { CrossChainRouteComponent } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/cross-chain-route/cross-chain-route.component';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { SwapSchemeModalComponent } from './components/swap-scheme-modal/swap-scheme-modal.component';
import { TradesCounterComponent } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-counter/trades-counter.component';
import { TradesListComponent } from 'src/app/features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-list/trades-list.component';
import { BestTradePanelComponent } from 'src/app/features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/best-trade-panel.component';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';
import { CrossChainCalculationService } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/cross-chain-calculation.service';
import { CrossChainBestRouteMobileComponent } from './components/cross-chain-bottom-form/components/best-trade-panel/components/cross-chain-best-route-mobile/cross-chain-best-route-mobile.component';
import { ModalsModule } from '@app/core/modals/modals.module';

@NgModule({
  declarations: [
    CrossChainBottomFormComponent,
    CrossChainRouteComponent,
    SwapSchemeModalComponent,
    TradesCounterComponent,
    TradesListComponent,
    BestTradePanelComponent,
    CrossChainBestRouteMobileComponent
  ],
  imports: [
    SwapsSharedModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiInputModule,
    InlineSVGModule,
    TuiHintModule,
    TuiBadgeModule,
    TuiSvgModule,
    TuiDataListModule,
    TuiHostedDropdownModule,
    TuiButtonModule,
    TuiDropdownModule,
    TuiLoaderModule,
    TuiAccordionModule,
    TuiScrollbarModule,
    ModalsModule
  ],
  exports: [CrossChainBottomFormComponent],
  providers: [CrossChainFormService, CrossChainCalculationService]
})
export class CrossChainModule {}
