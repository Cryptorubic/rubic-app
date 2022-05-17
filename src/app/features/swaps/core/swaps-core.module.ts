import { NgModule } from '@angular/core';

import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { RefreshButtonService } from '@features/swaps/core/services/refresh-button-service/refresh-button.service';
import { SuccessTxModalService } from '@features/swaps/core/services/success-tx-modal-service/success-tx-modal.service';

@NgModule({
  providers: [
    SwapsService,
    SwapFormService,
    SettingsService,
    RefreshButtonService,
    SuccessTxModalService
  ]
})
export class SwapsCoreModule {}
