import { Injectable } from '@angular/core';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { combineLatest, map, Observable, startWith } from 'rxjs';

@Injectable()
export class ClearswapPrivateActionButtonService extends PrivateActionButtonService {
  public override readonly buttonState$: Observable<PrivateActionButtonState> = combineLatest([
    this.walletConnector.networkChange$,
    this.privateTransferService.transferAsset$,
    this.privateTransferService.transferAmount$,
    this.targetNetworkAddressService.address$.pipe(startWith(''))
  ]).pipe(map(params => this.getState(...params)));

  private connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector, { providers: [WALLET_NAME.TRON_LINK] })
      .subscribe();
  }

  // TODO add override
  protected getState(
    network: BlockchainName | null,
    transferAsset: BalanceToken | null,
    transferAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null,
    receiver: string
  ): PrivateActionButtonState {
    if (!network || network !== BLOCKCHAIN_NAME.TRON) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (!transferAsset) {
      return {
        type: 'error',
        text: 'Select token'
      };
    }
    if (!transferAmount || transferAmount.visibleValue === '') {
      return {
        type: 'error',
        text: 'Enter amount'
      };
    }
    if (!receiver) {
      return {
        type: 'error',
        text: 'Enter receiver address'
      };
    }

    return {
      type: 'parent',
      text: 'Transfer token'
    };
  }
}
