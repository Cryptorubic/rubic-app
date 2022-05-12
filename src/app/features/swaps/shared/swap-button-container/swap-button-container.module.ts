import { NgModule } from '@angular/core';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/swap-button-container/services/swap-button-container-errors.service';
import { SwapButtonContainerComponent } from '@features/swaps/shared/swap-button-container/swap-button-container.component';
import { SwapButtonComponent } from '@features/swaps/shared/swap-button-container/components/swap-button/swap-button.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { ConnectWalletButtonComponent } from 'src/app/features/swaps/shared/swap-button-container/components/connect-wallet-button/connect-wallet-button.component';
import { SwapButtonContainerService } from '@features/swaps/shared/swap-button-container/services/swap-button-container.service';
import { UpdateRateButtonComponent } from '@features/swaps/shared/swap-button-container/components/update-rate-button/update-rate-button.component';
import { SwapButtonService } from '@features/swaps/shared/swap-button-container/services/swap-button.service';
import { ApproveSwapButtonComponent } from '@features/swaps/shared/swap-button-container/components/approve-swap-button/approve-swap-button.component';
import { ApproveSwapButtonService } from '@features/swaps/shared/swap-button-container/services/approve-swap-button.service';
import { ApproveButtonComponent } from 'src/app/features/swaps/shared/swap-button-container/components/approve-swap-button/approve-button/approve-button.component';
import { ErrorButtonComponent } from 'src/app/features/swaps/shared/swap-button-container/components/error-button/error-button.component';

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
