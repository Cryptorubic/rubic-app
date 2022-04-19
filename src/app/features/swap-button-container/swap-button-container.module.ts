import { NgModule } from '@angular/core';
import { SwapButtonContainerErrorsService } from '@features/swap-button-container/services/swap-button-container-errors.service';
import { SwapButtonContainerComponent } from '@features/swap-button-container/swap-button-container.component';
import { SwapButtonComponent } from '@features/swap-button-container/components/swap-button/swap-button.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { ConnectWalletButtonComponent } from './components/connect-wallet-button/connect-wallet-button.component';
import { SwapButtonContainerService } from '@features/swap-button-container/services/swap-button-container.service';

@NgModule({
  declarations: [SwapButtonContainerComponent, SwapButtonComponent, ConnectWalletButtonComponent],
  imports: [CommonModule, SharedModule],
  exports: [SwapButtonContainerComponent],
  providers: [SwapButtonContainerService, SwapButtonContainerErrorsService]
})
export class SwapButtonContainerModule {}
