import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { CommonWalletAdapter } from '../common-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { THEME, TonConnectUI } from '@tonconnect/ui';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { ENVIRONMENT } from 'src/environments/environment';
import { fetchFriendlyAddress } from './utils/ton-utils';

export class TonConnectAdapter extends CommonWalletAdapter<TonConnectUI> {
  public chainType = CHAIN_TYPE.TON;

  public walletName = WALLET_NAME.TON_CONNECT;

  private tonConnect: TonConnectUI;

  private listeners: Array<() => void> = [];

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);

    this.tonConnect = new TonConnectUI({
      manifestUrl: `http://bubamainer.fvds.ru/api/v1/tonconnect/manifest/${ENVIRONMENT.environmentName}`
    });
    this.tonConnect.uiOptions = {
      language: 'en',
      uiPreferences: {
        theme: THEME.DARK
      }
    };
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
      if (walletAndwalletInfo.account) {
        (async function (): Promise<void> {
          const rawAddress = walletAndwalletInfo.account.address;
          const friendlyAddress = await fetchFriendlyAddress(rawAddress);
          this.onAddressChanges$.next(friendlyAddress);
        }).call(this);
      } else {
        this.onAddressChanges$.next(null);
      }
    });

    this.listeners.push(unsubscribeStatus);
  }

  public async deactivate(): Promise<void> {
    await this.tonConnect.disconnect();
    this.listeners.forEach(unsub => unsub());
    super.deactivate();
  }
}
