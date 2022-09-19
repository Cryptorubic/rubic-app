import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { CrossChainRoutingBottomFormComponent } from '@features/swaps/features/cross-chain-routing/components/cross-chain-routing-bottom-form/cross-chain-routing-bottom-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiHintModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SmartRoutingComponent } from 'src/app/features/swaps/features/cross-chain-routing/components/smart-routing/smart-routing.component';
import { SwapButtonContainerModule } from '@features/swaps/shared/swap-button-container/swap-button-container.module';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { SwapSchemeModalComponent } from './components/swap-scheme-modal/swap-scheme-modal.component';
import { ProvidersCounterComponent } from './components/providers-counter/providers-counter.component';

@NgModule({
  declarations: [
    CrossChainRoutingBottomFormComponent,
    SmartRoutingComponent,
    SwapSchemeModalComponent,
    ProvidersCounterComponent
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
    SwapsSharedModule
  ],
  exports: [CrossChainRoutingBottomFormComponent],
  providers: []
})
export class CrossChainModule {}
