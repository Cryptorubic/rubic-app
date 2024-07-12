import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { CommonWalletAdapter } from '../common-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { THEME, TonConnectUI } from '@tonconnect/ui';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { ENVIRONMENT } from 'src/environments/environment';
import { AddressBookResponse } from './models/ton-utils-types';

export class TonConnectAdapter extends CommonWalletAdapter<TonConnectUI> {
  public readonly chainType = CHAIN_TYPE.TON;

  public readonly walletName = WALLET_NAME.TON_CONNECT;

  private readonly tonConnect: TonConnectUI;

  private readonly listeners: Array<() => void> = [];

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);

    this.tonConnect = new TonConnectUI({
      manifestUrl: `https://dev-api.rubic.exchange/api/info/tonconnect?env_id=${ENVIRONMENT.environmentName}`,
      uiPreferences: {
        theme: THEME.DARK
      },
      language: 'en'
    });
  }

  public async activate(): Promise<void> {
    try {
      this.listenEvents();
      await this.tonConnect.openModal();

      this.selectedChain = BLOCKCHAIN_NAME.TON;
      this.selectedAddress = this.tonConnect.account?.address;

      this.isEnabled = true;
      this.wallet = this.tonConnect;

      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);
    } catch (err) {
      console.log('TON_CONNECT_ACTIVATE_ERROR ===> ', err);
      throw err;
    }
  }

  private listenEvents(): void {
    const unsubscribeStatus = this.tonConnect.onStatusChange(walletAndwalletInfo => {
      if (walletAndwalletInfo?.account) {
        (async () => {
          const rawAddress = walletAndwalletInfo.account.address;
          const friendlyAddress = await this.fetchFriendlyAddress(rawAddress);
          this.onAddressChanges$.next(friendlyAddress);
        })();
      } else {
        this.onAddressChanges$.next(null);
      }
    });

    this.listeners.push(unsubscribeStatus);
  }

  private async fetchFriendlyAddress(rawAddress: string): Promise<string> {
    const res = (await (
      await fetch(`https://toncenter.com/api/v3/addressBook?address=${rawAddress}`)
    ).json()) as AddressBookResponse;
    const friendly = Object.values(res)[0].user_friendly;
    return friendly;
  }

  public async deactivate(): Promise<void> {
    await this.tonConnect.disconnect();
    this.listeners.forEach(unsub => unsub());
    super.deactivate();
  }
}
