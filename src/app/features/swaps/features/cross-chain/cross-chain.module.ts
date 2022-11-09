import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { CrossChainBottomFormComponent } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/cross-chain-bottom-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDropdownControllerModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiScrollbarModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { TuiAccordionModule, TuiBadgeModule, TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { CrossChainRouteComponent } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/cross-chain-route/cross-chain-route.component';
import { SwapButtonContainerModule } from '@features/swaps/shared/components/swap-button-container/swap-button-container.module';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { SwapSchemeModalComponent } from './components/swap-scheme-modal/swap-scheme-modal.component';
import { TradesCounterComponent } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-counter/trades-counter.component';
import { TradesListComponent } from 'src/app/features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-list/trades-list.component';
import { BestTradePanelComponent } from 'src/app/features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/best-trade-panel.component';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';
import { CrossChainCalculationService } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/cross-chain-calculation.service';

@NgModule({
  declarations: [
    CrossChainBottomFormComponent,
    CrossChainRouteComponent,
    SwapSchemeModalComponent,
    TradesCounterComponent,
    TradesListComponent,
    BestTradePanelComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiInputModule,
    InlineSVGModule,
    TuiHintModule,
    SwapButtonContainerModule,
    SwapsSharedModule,
    TuiBadgeModule,
    TuiSvgModule,
    TuiDataListModule,
    TuiHostedDropdownModule,
    TuiButtonModule,
    TuiDropdownControllerModule,
    TuiLoaderModule,
    TuiAccordionModule,
    TuiScrollbarModule
  ],
  exports: [CrossChainBottomFormComponent],
  providers: [CrossChainFormService, CrossChainCalculationService]
})
export class CrossChainModule {}
