import { NgModule } from '@angular/core';
import { OnramperExchangerRoutingModule } from '@features/onramper-exchange/onramper-exchanger-routing.module';
import { OnramperExchangerComponent } from './components/onramper-exchanger/onramper-exchanger.component';
import { SwapsModule } from '@features/swaps/swaps.module';
import { SharedModule } from '@shared/shared.module';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { SwapButtonContainerModule } from '@features/swaps/shared/components/swap-button-container/swap-button-container.module';

@NgModule({
  declarations: [OnramperExchangerComponent],
  exports: [],
  imports: [
    OnramperExchangerRoutingModule,
    SwapsModule,
    SharedModule,
    SwapsSharedModule,
    SwapButtonContainerModule
  ]
})
export class OnramperExchangerModule {}
