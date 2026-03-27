import { inject, Injectable } from '@angular/core';
import { ClearswapErrorService } from '@app/features/privacy/providers/clearswap/services/clearswap-error.service';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BLOCKCHAIN_NAME, BlockchainName, ErrorInterface } from '@cryptorubic/core';
import { Web3Pure } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import { combineLatest, filter, Observable, switchMap } from 'rxjs';
import { CLEARSWAP_SUPPORTED_WALLETS } from '../constants/clearswap-supported-wallerts';

@Injectable()
export class ClearswapPrivateActionButtonService extends PrivateActionButtonService {
  private readonly clearswapErrorService = inject(ClearswapErrorService);

  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(page => !!page),
      switchMap(page =>
        page.type === 'transfer'
          ? combineLatest([
              this.walletConnector.networkChange$,
              this.privateTransferWindowService.transferAsset$,
              this.privateTransferWindowService.transferAmount$,
              this._receiverAddress$,
              this.clearswapErrorService.tradeError$
            ]).pipe(switchMap(params => this.getTransferState(...params)))
          : combineLatest([
              this.walletConnector.networkChange$,
              this.privateSwapWindowService.swapInfo$,
              this._receiverAddress$,
              this.clearswapErrorService.tradeError$
            ]).pipe(switchMap(params => this.getSwapState(...params)))
      )
    );

  private connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector, { providers: CLEARSWAP_SUPPORTED_WALLETS })
      .subscribe();
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
    const isAddressCorrect = await Web3Pure.getInstance(BLOCKCHAIN_NAME.TRON).isAddressCorrect(
      receiver
    );
    if (!isAddressCorrect) {
      return {
        type: 'error',
        text: 'Incorrect receiver address'
      };
    }
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
        text: 'Review Order'
      };
    }

    return {
      type: 'parent',
      text: 'Review Order'
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
    if (isNaN(transferAmount?.actualValue.toNumber()) || transferAmount?.actualValue.isZero()) {
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
    const isAddressCorrect = await Web3Pure.getInstance(BLOCKCHAIN_NAME.TRON).isAddressCorrect(
      receiver
    );
    if (!isAddressCorrect) {
      return {
        type: 'error',
        text: 'Incorrect receiver address'
      };
    }
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
