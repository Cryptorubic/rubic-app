import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { CrossChainRoutingBottomFormComponent } from 'src/app/features/cross-chain-routing/components/cross-chain-routing-bottom-form/cross-chain-routing-bottom-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiHintModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TargetNetworkAddressComponent } from './components/target-network-address/target-network-address.component';
import { SmartRoutingComponent } from './components/smart-routing/smart-routing.component';
import { SwapButtonContainerModule } from '@features/swap-button-container/swap-button-container.module';

@NgModule({
  declarations: [
    CrossChainRoutingBottomFormComponent,
    TargetNetworkAddressComponent,
    SmartRoutingComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiInputModule,
    InlineSVGModule,
    TuiHintModule,
    SwapButtonContainerModule
  ],
  exports: [CrossChainRoutingBottomFormComponent]
})
export class CrossChainModule {}
