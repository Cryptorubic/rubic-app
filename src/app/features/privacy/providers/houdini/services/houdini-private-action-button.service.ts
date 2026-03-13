import { inject, Injectable } from '@angular/core';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BlockchainName, BlockchainsInfo, CHAIN_TYPE, ErrorInterface } from '@cryptorubic/core';
import { Web3Pure } from '@cryptorubic/web3';
import { combineLatest, filter, Observable, switchMap } from 'rxjs';
import { HoudiniErrorService } from './houdini-error.service';

@Injectable()
export class HoudiniPrivateActionButtonService extends PrivateActionButtonService {
  private readonly houdiniErrorService = inject(HoudiniErrorService);

  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(page => !!page),
      switchMap(_ =>
        combineLatest([
          this.walletConnector.networkChange$,
          this.privateSwapWindowService.swapInfo$,
          this._receiverAddress$,
          this.houdiniErrorService.tradeError$
        ]).pipe(switchMap(params => this.getSwapState(...params)))
      )
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
    const chainType = network ? BlockchainsInfo.getChainType(network) : null;

    if (!network || chainType !== CHAIN_TYPE.EVM) {
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
    const isAddressCorrect = await Web3Pure.getInstance(network).isAddressCorrect(receiver);
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
        text: 'Calculating'
      };
    }

    return {
      type: 'parent',
      text: 'Review Order'
    };
  }
}
