import { NgModule } from '@angular/core';
import { SwapButtonContainerErrorsService } from '@features/swap-button-container/services/swap-button-container-errors.service';
import { SwapButtonContainerComponent } from '@features/swap-button-container/swap-button-container.component';
import { SwapButtonComponent } from '@features/swap-button-container/components/swap-button/swap-button.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { ConnectWalletButtonComponent } from './components/connect-wallet-button/connect-wallet-button.component';
import { SwapButtonContainerService } from '@features/swap-button-container/services/swap-button-container.service';
import { UpdateRateButtonComponent } from '@features/swap-button-container/components/update-rate-button/update-rate-button.component';
import { SwapButtonService } from '@features/swap-button-container/services/swap-button.service';

@NgModule({
  declarations: [
    SwapButtonContainerComponent,
    SwapButtonComponent,
    ConnectWalletButtonComponent,
    UpdateRateButtonComponent
  ],
  imports: [CommonModule, SharedModule],
  exports: [SwapButtonContainerComponent],
  providers: [SwapButtonContainerService, SwapButtonContainerErrorsService, SwapButtonService]
})
export class SwapButtonContainerModule {}
