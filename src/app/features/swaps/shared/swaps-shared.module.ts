import { NgModule } from '@angular/core';
import { TokensRateComponent } from '@features/swaps/shared/tokens-rate/tokens-rate.component';
import { AmountEstimatedComponent } from '@features/swaps/shared/token-amount-estimated/token-amount-estimated.component';
import { SharedModule } from '@shared/shared.module';
import { TuiHintModule } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
  declarations: [AmountEstimatedComponent, TokensRateComponent],
  exports: [AmountEstimatedComponent, TokensRateComponent],
  imports: [CommonModule, SharedModule, TuiHintModule, InlineSVGModule],
  providers: []
})
export class SwapsSharedModule {}
