import { NgModule } from '@angular/core';
import { TokensRateComponent } from '@features/swaps/shared/tokens-rate/tokens-rate.component';
import { AmountEstimatedComponent } from '@features/swaps/shared/token-amount-estimated/token-amount-estimated.component';
import { SharedModule } from '@shared/shared.module';
import { TuiHintModule } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';
import { TokensSelectModule } from '@features/swaps/shared/tokens-select/tokens-select.module';
import { SwapButtonContainerModule } from '@features/swaps/shared/swap-button-container/swap-button-container.module';
import { RubicTokensComponent } from '@features/swaps/shared/rubic-tokens/rubic-tokens.component';

@NgModule({
  declarations: [AmountEstimatedComponent, TokensRateComponent, RubicTokensComponent],
  exports: [
    AmountEstimatedComponent,
    TokensRateComponent,
    SwapButtonContainerModule,
    RubicTokensComponent
  ],
  imports: [
    // own modules start
    TokensSelectModule,
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
