import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { RubicWindow } from '@shared/utils/rubic-window';
import { RubicError } from '@core/errors/models/rubic-error';

export class TronLinkAdapter extends CommonWalletAdapter {
  public readonly chainType = CHAIN_TYPE.TRON;

  public readonly walletName = WALLET_NAME.TRON_LINK;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone);
    this.wallet = window.tronLink;
    // @TODO add change events
  }

  public async activate(): Promise<void> {
    const response = await this.wallet.request({ method: 'tron_requestAccounts' });
    if (response.code !== 200) {
      if (
        response.code === 4001 ||
        response.message?.toLowerCase().includes('user rejected the request')
      ) {
        throw new SignRejectError();
      }
      if (response === '') {
        throw new RubicError('Please, check you unlocked wallet extension.'); // @todo add error
      }
      throw new Error(response.message);
    }
    this.isEnabled = true;

    this.selectedAddress = this.wallet.tronWeb.defaultAddress.base58;
    this.selectedChain = BLOCKCHAIN_NAME.TRON; // @todo add check
    this.onAddressChanges$.next(this.selectedAddress);
    this.onNetworkChanges$.next(this.selectedChain);
  }

  public deactivate(): void {
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }
}
