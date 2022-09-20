import { NgModule } from '@angular/core';
import { TokensRateComponent } from '@features/swaps/shared/tokens-rate/tokens-rate.component';
import { AmountEstimatedComponent } from '@features/swaps/shared/token-amount-estimated/token-amount-estimated.component';
import { SharedModule } from '@shared/shared.module';
import { TuiHintModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TargetNetworkAddressComponent } from '@features/swaps/shared/target-network-address/target-network-address.component';
import { TargetNetworkAddressService } from '@features/swaps/shared/target-network-address/services/target-network-address.service';
import { TuiInputModule } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AmountEstimatedComponent, TokensRateComponent, TargetNetworkAddressComponent],
  exports: [AmountEstimatedComponent, TokensRateComponent, TargetNetworkAddressComponent],
  imports: [
    CommonModule,
    SharedModule,
    TuiHintModule,
    InlineSVGModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule
  ],
  providers: [TargetNetworkAddressService]
})
export class SwapsSharedModule {}
