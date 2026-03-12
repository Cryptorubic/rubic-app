import { Injectable } from '@angular/core';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { combineLatest, filter, map, Observable, startWith, switchMap } from 'rxjs';

@Injectable()
export class ClearswapPrivateActionButtonService extends PrivateActionButtonService {
  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(page => !!page),
      switchMap(page =>
        page.type === 'transfer'
          ? combineLatest([
              this.walletConnector.networkChange$,
              this.privateTransferWindowService.transferAsset$,
              this.privateTransferWindowService.transferAmount$,
              this.targetNetworkAddressService.address$.pipe(startWith(''))
            ]).pipe(map(params => this.getTransferState(...params)))
          : combineLatest([
              this.walletConnector.networkChange$,
              this.privateSwapWindowService.swapInfo$,
              this.targetNetworkAddressService.address$.pipe(startWith(''))
            ]).pipe(map(params => this.getSwapState(...params)))
      )
    );

  private connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector, { providers: [WALLET_NAME.TRON_LINK] })
      .subscribe();
  }

  private getSwapState(
    network: BlockchainName | null,
    swapInfo: PrivateSwapInfo,
    receiver: string
  ): PrivateActionButtonState {
    if (!network || network !== BLOCKCHAIN_NAME.TRON) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (!swapInfo.fromAsset || !swapInfo.toAsset) {
      return {
        type: 'error',
        text: 'Select tokens'
      };
    }
    if (
      isNaN(swapInfo.fromAmount?.actualValue.toNumber()) ||
      swapInfo.fromAmount?.actualValue.isZero()
    ) {
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
      text: 'Review Order'
    };
  }

  private getTransferState(
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
    if (isNaN(transferAmount.actualValue.toNumber()) || transferAmount.actualValue.isZero()) {
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
