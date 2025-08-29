import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { TonConnectAbstractAdapter } from './abstract/ton-connect-abstract-adapter';
import { BehaviorSubject } from 'rxjs';
import { BlockchainName } from '@cryptorubic/sdk';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { HttpService } from '@app/core/services/http/http.service';
import { StoreService } from '@app/core/services/store/store.service';

export class MyTonWalletAdapter extends TonConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.MY_TON_WALLET;

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
    return this.tonConnect.openSingleWalletModal('mytonwallet');
  }
}
