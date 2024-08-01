import { TonConnectUI } from '@tonconnect/ui';
import { CommonWalletAdapter } from '../../common-wallet-adapter';
import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { HttpService } from '@app/core/services/http/http.service';
import { AddressBookResponse } from '../models/ton-utils-types';
import { StoreService } from '@app/core/services/store/store.service';
import {
  PopularTonConnectWallets,
  TON_CONNECT_WALLETS_MAP
} from '../models/ton-connect-wallets-map';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { TonConnectInstance } from '../utils/ton-connect-instance';

export abstract class TonConnectAbstractAdapter extends CommonWalletAdapter<TonConnectUI> {
  public readonly chainType = CHAIN_TYPE.TON;

  protected tonConnect: TonConnectUI;

  private unsubEventListener: () => void;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    private readonly httpService: HttpService,
    private readonly storeService: StoreService
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    try {
      this.tonConnect = TonConnectInstance.getInstance();

      this.listenStatusChangeEvent();

      try {
        await this.tonConnect.connector.restoreConnection();
      } catch {}
      const isConnected = (await this.tonConnect.connectionRestored) && this.tonConnect.connected;

      if (!isConnected) {
        await this.openWalletModal();
      }

      this.selectedChain = BLOCKCHAIN_NAME.TON;
      this.selectedAddress = this.tonConnect.account?.address;

      this.isEnabled = true;
      this.wallet = this.tonConnect;

      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);
    } catch (err) {
      console.error('[TonConnectAbstractAdapter] Activation error - ', err);
      throw err;
    }
  }

  public async deactivate(): Promise<void> {
    await this.tonConnect?.disconnect();
    this.unsubEventListener();
    super.deactivate();
  }

  private listenStatusChangeEvent(): void {
    this.unsubEventListener = this.tonConnect.onStatusChange(walletAndWalletInfo => {
      if (walletAndWalletInfo?.account) {
        const tonConnectWalletName = walletAndWalletInfo.appName;
        const rawAddress = walletAndWalletInfo.account.address;

        this.fetchFriendlyAddress(rawAddress)
          .then(friendlyAddress => {
            this.selectedAddress = friendlyAddress;
            this.onAddressChanges$.next(this.selectedAddress);
          })
          .catch(() => this.onAddressChanges$.next(null));

        if (walletAndWalletInfo.appName in TON_CONNECT_WALLETS_MAP) {
          this.storeService.setItem(
            'RUBIC_PROVIDER',
            TON_CONNECT_WALLETS_MAP[tonConnectWalletName as PopularTonConnectWallets]
          );
        } else {
          this.storeService.setItem('RUBIC_PROVIDER', WALLET_NAME.TON_CONNECT);
        }
      } else {
        this.onAddressChanges$.next(null);
      }
    });
  }

  protected async fetchFriendlyAddress(rawAddress: string): Promise<string> {
    const url = window.encodeURI(`https://tonapi.io/v2/address/${rawAddress}/parse`);
    const res = await firstValueFrom(this.httpService.get<AddressBookResponse>('', {}, url));
    const friendly = res.non_bounceable.b64url;
    return friendly;
  }

  protected abstract openWalletModal(): Promise<void>;
}
