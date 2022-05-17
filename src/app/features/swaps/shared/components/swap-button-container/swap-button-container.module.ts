import { NgModule } from '@angular/core';
import { SwapButtonContainerComponent } from '@features/swaps/shared/components/swap-button-container/swap-button-container.component';
import { SwapButtonService } from '@features/swaps/shared/components/swap-button-container/services/swap-button.service';
import { ApproveSwapButtonComponent } from '@features/swaps/shared/components/swap-button-container/components/approve-swap-button/approve-swap-button.component';
import { CommonModule } from '@angular/common';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container-errors.service';
import { ApproveButtonComponent } from '@features/swaps/shared/components/swap-button-container/components/approve-swap-button/approve-button/approve-button.component';
import { ApproveSwapButtonService } from '@features/swaps/shared/components/swap-button-container/services/approve-swap-button.service';
import { UpdateRateButtonComponent } from '@features/swaps/shared/components/swap-button-container/components/update-rate-button/update-rate-button.component';
import { ErrorButtonComponent } from '@features/swaps/shared/components/swap-button-container/components/error-button/error-button.component';
import { SharedModule } from '@shared/shared.module';
import { ConnectWalletButtonComponent } from '@features/swaps/shared/components/swap-button-container/components/connect-wallet-button/connect-wallet-button.component';
import { SwapButtonComponent } from '@features/swaps/shared/components/swap-button-container/components/swap-button/swap-button.component';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';

@NgModule({
  declarations: [
    SwapButtonContainerComponent,
    SwapButtonComponent,
    ConnectWalletButtonComponent,
    UpdateRateButtonComponent,
    ApproveSwapButtonComponent,
    ApproveButtonComponent,
    ErrorButtonComponent
  ],
  imports: [CommonModule, SharedModule],
  exports: [SwapButtonContainerComponent],
  providers: [
    SwapButtonContainerService,
    SwapButtonContainerErrorsService,
    SwapButtonService,
    ApproveSwapButtonService
  ]
})
export class SwapButtonContainerModule {}
