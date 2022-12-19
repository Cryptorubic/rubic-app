import { NgModule } from '@angular/core';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { SuccessTxModalService } from '@features/swaps/features/swap-form/services/success-tx-modal-service/success-tx-modal.service';

@NgModule({
  providers: [
    SettingsService,
    RefreshService,
    TradeService,
    TargetNetworkAddressService,
    SuccessTxModalService
  ]
})
export class SwapsCoreModule {}
