import { NgModule } from '@angular/core';
import { SwapButtonContainerErrorsService } from '@features/swap-button-container/services/swap-button-container-errors.service';
import { SwapButtonContainerComponent } from '@features/swap-button-container/swap-button-container.component';
import { SwapButtonComponent } from '@features/swap-button-container/components/swap-button/swap-button.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [SwapButtonContainerComponent, SwapButtonComponent],
  imports: [CommonModule, SharedModule],
  exports: [SwapButtonContainerComponent],
  providers: [SwapButtonContainerErrorsService]
})
export class SwapButtonContainerModule {}
