import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { CommonWalletAdapter } from '../common-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { THEME, TonConnectUI, WalletsModalState } from '@tonconnect/ui';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { ENVIRONMENT } from 'src/environments/environment';

export class TonConnectAdapter extends CommonWalletAdapter {
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

      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);
    } catch (err) {
      console.log('TON_CONNECT_ACTIVATE_ERROR ===> ', err);
      throw err;
    }
  }

  private listenEvents(): void {
    const unsubscribeModal = this.tonConnect.onModalStateChange((state: WalletsModalState) => {
      console.log('listenModalChanges =====> ', state);
    });
    const unsubscribeStatus = this.tonConnect.onStatusChange(walletAndwalletInfo => {
      this.onAddressChanges$.next(walletAndwalletInfo.account.address);
      console.log('listenStatusChange =====> ', walletAndwalletInfo.account.address);
    });

    this.listeners.push(unsubscribeModal, unsubscribeStatus);
  }

  public async deactivate(): Promise<void> {
    await this.tonConnect.disconnect();
    this.listeners.forEach(unsub => unsub());
    super.deactivate();
  }
}
