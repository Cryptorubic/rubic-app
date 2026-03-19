import { inject, Injectable } from '@angular/core';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BLOCKCHAIN_NAME, BlockchainName, ErrorInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { combineLatest, filter, Observable, switchMap } from 'rxjs';
import { RailgunErrorService } from '@features/privacy/providers/railgun/services/common/railgun-error.service';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';

@Injectable()
export class RailgunPrivateActionButtonService extends PrivateActionButtonService {
  private readonly errorService = inject(RailgunErrorService);

  private readonly railgunFacadeService = inject(RailgunFacadeService);

  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(page => !!page),
      switchMap(page => {
        if (page.type === 'hide') {
          return combineLatest([
            this.walletConnector.networkChange$,
            this.hideWindowService.hideAsset$,
            this.hideWindowService.hideAmount$
          ]).pipe(switchMap(params => this.getShieldingState(...params)));
        }
        if (page.type === 'transfer') {
          return combineLatest([
            this.walletConnector.networkChange$,
            this.privateTransferWindowService.transferAsset$,
            this.privateTransferWindowService.transferAmount$,
            this._receiverAddress$.asObservable(),
            this.errorService.tradeError$
          ]).pipe(switchMap(params => this.getTransferState(...params)));
        }
        if (page.type === 'reveal') {
          return combineLatest([
            this.walletConnector.networkChange$,
            this.revealWindowService.revealAsset$,
            this.revealWindowService.revealAmount$
          ]).pipe(switchMap(params => this.getUnshieldingState(...params)));
        }
      })
    );

  private connectWallet(): void {
    this.modalService.openWalletModal(this.injector).subscribe();
  }

  private async getSwapState(
    network: BlockchainName | null,
    swapInfo: PrivateSwapInfo,
    receiver: string,
    tradeError: ErrorInterface
  ): Promise<PrivateActionButtonState> {
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
    // @TODO check receiver
    // const isAddressCorrect = await Web3Pure.getInstance(BLOCKCHAIN_NAME.TRON).isAddressCorrect(
    //   receiver
    // );
    // if (!isAddressCorrect) {
    //   return {
    //     type: 'error',
    //     text: 'Incorrect receiver address'
    //   };
    // }
    if (tradeError) {
      return {
        type: 'error',
        text: tradeError.reason
      };
    }
    if (
      isNaN(swapInfo.toAmount?.actualValue.toNumber()) ||
      swapInfo.toAmount?.actualValue.isZero()
    ) {
      return {
        type: 'error',
        text: 'Calculating'
      };
    }

    return {
      type: 'parent',
      text: 'Review Order'
    };
  }

  private async getShieldingState(
    network: BlockchainName | null,
    shieldAsset: BalanceToken | null,
    shieldAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null
  ): Promise<PrivateActionButtonState> {
    if (!network) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (!shieldAsset) {
      return {
        type: 'error',
        text: 'Select token'
      };
    }
    if (isNaN(shieldAmount.actualValue.toNumber()) || shieldAmount.actualValue.isZero()) {
      return {
        type: 'error',
        text: 'Enter amount'
      };
    }
    return {
      type: 'parent',
      text: 'Shield token'
    };
  }

  private async getUnshieldingState(
    network: BlockchainName | null,
    unshieldAsset: BalanceToken | null,
    unshieldAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null
  ): Promise<PrivateActionButtonState> {
    if (!network) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (!unshieldAsset) {
      return {
        type: 'error',
        text: 'Select token'
      };
    }
    if (isNaN(unshieldAmount.actualValue.toNumber()) || unshieldAmount.actualValue.isZero()) {
      return {
        type: 'error',
        text: 'Enter amount'
      };
    }
    return {
      type: 'parent',
      text: 'Unshield token'
    };
  }

  private async getTransferState(
    network: BlockchainName | null,
    transferAsset: BalanceToken | null,
    transferAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null,
    receiver: string,
    tradeError: ErrorInterface
  ): Promise<PrivateActionButtonState> {
    if (!network) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    // @TODO add different connected wallets handling
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
    // const isAddressCorrect = await Web3Pure.getInstance(network).isAddressCorrect(receiver);
    // if (!isAddressCorrect) {
    //   return {
    //     type: 'error',
    //     text: 'Incorrect receiver address'
    //   };
    // }
    if (tradeError) {
      return {
        type: 'error',
        text: tradeError.reason
      };
    }
    return {
      type: 'parent',
      text: 'Transfer token'
    };
  }
}
