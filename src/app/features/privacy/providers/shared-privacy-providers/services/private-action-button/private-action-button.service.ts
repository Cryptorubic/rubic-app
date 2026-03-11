import { Inject, Injectable, Injector } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivateTransferService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-transfer/private-transfer.service';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class PrivateActionButtonService {
  public readonly buttonState$: Observable<PrivateActionButtonState> = of({
    type: 'parent',
    text: 'Transfer Tokens'
  });

  constructor(
    protected readonly walletConnector: WalletConnectorService,
    protected readonly modalService: ModalService,
    @Inject(Injector) protected readonly injector: Injector,
    protected readonly privateTransferService: PrivateTransferService,
    protected readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {}
}
