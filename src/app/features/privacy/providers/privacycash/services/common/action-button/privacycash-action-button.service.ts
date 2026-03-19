import { Injectable } from '@angular/core';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import {
  PrivateSwapInfo,
  SwapAmount
} from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BlockchainName } from '@cryptorubic/core';
import { Web3Pure } from '@cryptorubic/web3';
import { Observable, combineLatest, filter, switchMap } from 'rxjs';
import { PRIVACYCASH_SUPPORTED_WALLETS } from '../../../constants/wallets';
import { compareAddresses } from '@app/shared/utils/utils';

@Injectable()
export class PrivacycashActionButtonService extends PrivateActionButtonService {
  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(page => !!page),
      switchMap(page => {
        switch (page.type) {
          case 'transfer':
            return combineLatest([
              this.walletConnector.networkChange$,
              this.walletConnector.addressChange$,
              this.privateTransferWindowService.transferAsset$,
              this.privateTransferWindowService.transferAmount$,
              this._receiverAddress$
            ]).pipe(switchMap(params => this.getTransferState(...params)));
          case 'swap':
            return combineLatest([
              this.walletConnector.networkChange$,
              this.privateSwapWindowService.swapInfo$
            ]).pipe(switchMap(params => this.getSwapState(...params)));
          case 'hide':
            return combineLatest([
              this.walletConnector.networkChange$,
              this.hideWindowService.hideAsset$,
              this.hideWindowService.hideAmount$
            ]).pipe(switchMap(params => this.getHideState(...params)));
          case 'reveal':
            return combineLatest([
              this.walletConnector.networkChange$,
              this.walletConnector.addressChange$,
              this.revealWindowService.revealAsset$,
              this.revealWindowService.revealAmount$,
              this._receiverAddress$
            ]).pipe(switchMap(params => this.getRevealState(...params)));
          case 'refund':
            return combineLatest([
              this.walletConnector.networkChange$,
              this.privateTransferWindowService.transferAsset$
            ]).pipe(switchMap(params => this.getRefundState(...params)));
        }
      })
    );

  private connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector, { providers: PRIVACYCASH_SUPPORTED_WALLETS })
      .subscribe();
  }

  private async getSwapState(
    network: BlockchainName | null,
    swapInfo: PrivateSwapInfo
  ): Promise<PrivateActionButtonState> {
    if (!swapInfo.fromAsset || !swapInfo.toAsset) {
      return {
        type: 'error',
        text: 'Select tokens'
      };
    }
    if (!network || network !== swapInfo.fromAsset.blockchain) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
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
    const srcUsdAmount = swapInfo.fromAmount.actualValue.multipliedBy(swapInfo.fromAsset.price);
    if (srcUsdAmount.lt(10.5)) {
      return {
        type: 'error',
        text: 'Minimum swap is $10.5.'
      };
    }
    if (
      isNaN(swapInfo.toAmount?.actualValue.toNumber()) ||
      swapInfo.toAmount?.actualValue.isZero()
    ) {
      return {
        type: 'error',
        text: 'Calculation failed'
      };
    }
    if (swapInfo.fromAsset.amount.lt(swapInfo.fromAmount.actualValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }
    return {
      type: 'parent',
      text: 'Swap'
    };
  }

  private async getTransferState(
    network: BlockchainName | null,
    userAddr: string,
    transferAsset: BalanceToken | null,
    transferAmount: SwapAmount | null,
    receiver: string
  ): Promise<PrivateActionButtonState> {
    if (!transferAsset) {
      return {
        type: 'error',
        text: 'Select token'
      };
    }
    if (!network || network !== transferAsset.blockchain) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (isNaN(transferAmount.actualValue.toNumber()) || transferAmount.actualValue.isZero()) {
      return {
        type: 'error',
        text: 'Enter amount'
      };
    }
    const srcUsdAmount = transferAmount.actualValue.multipliedBy(transferAsset.price);
    if (srcUsdAmount.lt(2)) {
      return {
        type: 'error',
        text: 'Minimum transfer is $2.'
      };
    }
    if (transferAsset.amount.lt(transferAmount.actualValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }
    if (!receiver) {
      return {
        type: 'error',
        text: 'Enter receiver address'
      };
    }
    if (compareAddresses(userAddr, receiver)) {
      return {
        type: 'error',
        text: 'Enter another receiver wallet'
      };
    }
    const isAddressCorrect = await Web3Pure.getInstance(transferAsset.blockchain).isAddressCorrect(
      receiver
    );
    if (!isAddressCorrect) {
      return {
        type: 'error',
        text: 'Incorrect receiver address'
      };
    }
    return {
      type: 'parent',
      text: 'Transfer token'
    };
  }

  private async getRevealState(
    network: BlockchainName | null,
    userAddr: string,
    revealAsset: BalanceToken | null,
    revealAmount: SwapAmount | null,
    receiver: string
  ): Promise<PrivateActionButtonState> {
    if (!revealAsset) {
      return {
        type: 'error',
        text: 'Select token'
      };
    }
    if (!network || network !== revealAsset.blockchain) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (isNaN(revealAmount.actualValue.toNumber()) || revealAmount.actualValue.isZero()) {
      return {
        type: 'error',
        text: 'Enter amount'
      };
    }
    const srcUsdAmount = revealAmount.actualValue.multipliedBy(revealAsset.price);
    if (srcUsdAmount.lt(2)) {
      return {
        type: 'error',
        text: 'Minimum unshield is $2.'
      };
    }
    if (revealAsset.amount.lt(revealAmount.actualValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }
    if (!receiver) {
      return {
        type: 'error',
        text: 'Enter receiver address'
      };
    }
    if (compareAddresses(userAddr, receiver)) {
      return {
        type: 'error',
        text: 'Enter another receiver wallet'
      };
    }
    const isAddressCorrect = await Web3Pure.getInstance(revealAsset.blockchain).isAddressCorrect(
      receiver
    );
    if (!isAddressCorrect) {
      return {
        type: 'error',
        text: 'Incorrect receiver address'
      };
    }
    return {
      type: 'parent',
      text: 'Unshield token'
    };
  }

  private async getHideState(
    network: BlockchainName | null,
    hideAsset: BalanceToken | null,
    hideAmount: SwapAmount | null
  ): Promise<PrivateActionButtonState> {
    if (!hideAsset) {
      return {
        type: 'error',
        text: 'Select token'
      };
    }
    if (!network || network !== hideAsset.blockchain) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (isNaN(hideAmount.actualValue.toNumber()) || hideAmount.actualValue.isZero()) {
      return {
        type: 'error',
        text: 'Enter amount'
      };
    }
    if (hideAsset.amount.lt(hideAmount.actualValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }
    return {
      type: 'parent',
      text: 'Shield token'
    };
  }

  private async getRefundState(
    network: BlockchainName | null,
    refundAsset: BalanceToken | null
  ): Promise<PrivateActionButtonState> {
    if (!refundAsset) {
      return {
        type: 'error',
        text: 'Select token'
      };
    }
    if (!network || network !== refundAsset.blockchain) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    return {
      type: 'parent',
      text: 'Refund token'
    };
  }
}
