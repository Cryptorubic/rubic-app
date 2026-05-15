import { BlockchainName } from '@cryptorubic/core';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { HttpService } from '@app/core/services/http/http.service';
import { TonConnectAbstractAdapter } from './abstract/ton-connect-abstract-adapter';
import { StoreService } from '@app/core/services/store/store.service';

export class TonConnectAdapter extends TonConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.TON_CONNECT;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    httpService: HttpService,
    storeService: StoreService
  ) {
    super(
      onAddressChanges$,
      onNetworkChanges$,
      errorsService,
      zone,
      window,
      httpService,
      storeService
    );
  }

  protected openWalletModal(): Promise<void> {
    return this.tonConnect.openModal();
  }
}
