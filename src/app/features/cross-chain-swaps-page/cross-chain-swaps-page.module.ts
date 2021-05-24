import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { SharedModule } from 'src/app/shared/shared.module';
import { TradeInProgressModalComponent } from 'src/app/features/cross-chain-swaps-page/common/modals/trade-in-progress/trade-in-progress-modal.component';
import { TradeSuccessModalComponent } from 'src/app/features/cross-chain-swaps-page/common/modals/trade-success/trade-success-modal.component';
import { CrossChainSwapsPageRoutingModule } from './cross-chain-swaps-page-routing.module';
import { CrossChainSwapsComponent } from './main-page/cross-chain-swaps.component';

@NgModule({
  declarations: [
    CrossChainSwapsComponent,
    TradeInProgressModalComponent,
    TradeSuccessModalComponent
  ],
  imports: [
    CommonModule,
    CrossChainSwapsPageRoutingModule,
    TranslateModule,
    SharedModule,
    InlineSVGModule
  ],
  exports: [TradeInProgressModalComponent, TradeSuccessModalComponent]
})
export class CrossChainSwapsPageModule {}
