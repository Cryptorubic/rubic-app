import { NgModule } from '@angular/core';
import { TokensRateComponent } from '@features/swaps/shared/components/tokens-rate/tokens-rate.component';
import { AmountEstimatedComponent } from '@features/swaps/shared/components/token-amount-estimated/token-amount-estimated.component';
import { SharedModule } from '@shared/shared.module';
import { TuiHintModule } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';
import { TokensSelectorModule } from '@features/swaps/shared/components/tokens-selector/tokens-selector.module';
import { SwapButtonContainerModule } from '@features/swaps/shared/components/swap-button-container/swap-button-container.module';
import { IframeBlockchainIndicatorComponent } from '@features/swaps/shared/components/iframe-blockchain-indicator/iframe-blockchain-indicator.component';

@NgModule({
  declarations: [AmountEstimatedComponent, TokensRateComponent, IframeBlockchainIndicatorComponent],
  exports: [
    AmountEstimatedComponent,
    TokensRateComponent,
    SwapButtonContainerModule,
    TokensSelectorModule,
    IframeBlockchainIndicatorComponent
  ],
  imports: [
    // own modules start
    TokensSelectorModule,
    SwapButtonContainerModule,
    // own modules end
    CommonModule,
    SharedModule,
    SwapsCoreModule,
    TuiHintModule,
    InlineSVGModule
  ]
})
export class SwapsSharedModule {}
