import { Inject, Injectable, Injector } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { PrivateSwapWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { PrivateTransferWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-transfer-window/private-transfer-window.service';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { filter, map, Observable } from 'rxjs';

@Injectable()
export class PrivateActionButtonService {
  public readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(page => !!page),
      map(page =>
        page.type === 'transfer'
          ? {
              type: 'parent',
              text: 'Transfer token'
            }
          : {
              type: 'parent',
              text: 'Review Order'
            }
      )
    );

  constructor(
    protected readonly walletConnector: WalletConnectorService,
    protected readonly modalService: ModalService,
    @Inject(Injector) protected readonly injector: Injector,
    protected readonly privateTransferWindowService: PrivateTransferWindowService,
    protected readonly privateSwapWindowService: PrivateSwapWindowService,
    protected readonly targetNetworkAddressService: TargetNetworkAddressService,
    protected readonly privatePageTypeService: PrivatePageTypeService
  ) {}
}
