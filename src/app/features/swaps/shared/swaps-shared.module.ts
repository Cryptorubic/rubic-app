import { NgModule } from '@angular/core';
import { TokensRateComponent } from '@features/swaps/shared/components/tokens-rate/tokens-rate.component';
import { ToAmountEstimatedComponent } from '@features/swaps/shared/components/to-amount-estimated/to-amount-estimated.component';
import { SharedModule } from '@shared/shared.module';
import { TuiHintModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TargetNetworkAddressComponent } from '@features/swaps/shared/components/target-network-address/target-network-address.component';
import { TuiInputModule, TuiTagModule } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsWarningModalComponent } from './components/settings-warning-modal/settings-warning-modal.component';
import { SelectAssetButtonComponent } from '@features/swaps/shared/components/select-asset-button/select-asset-button.component';
import { SwapButtonContainerModule } from '@features/swaps/shared/components/swap-button-container/swap-button-container.module';
import { TokenAmountInputComponent } from '@features/swaps/shared/components/amount-input/components/token-amount-input/token-amount-input.component';
import { UserBalanceContainerComponent } from '@features/swaps/shared/components/amount-input/components/user-balance-container/user-balance-container.component';

@NgModule({
  declarations: [
    ToAmountEstimatedComponent,
    TokensRateComponent,
    TargetNetworkAddressComponent,
    SettingsWarningModalComponent,
    SelectAssetButtonComponent,
    TokenAmountInputComponent,
    UserBalanceContainerComponent
  ],
  exports: [
    ToAmountEstimatedComponent,
    TokensRateComponent,
    TargetNetworkAddressComponent,
    SettingsWarningModalComponent,
    SelectAssetButtonComponent,
    SwapButtonContainerModule,
    TokenAmountInputComponent,
    UserBalanceContainerComponent,
    CommonModule,
    SharedModule
  ],
  imports: [
    CommonModule,
    SharedModule,
    TuiHintModule,
    InlineSVGModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    TuiTagModule
  ]
})
export class SwapsSharedModule {}
