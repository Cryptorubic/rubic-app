import { Injectable } from '@angular/core';
import { PrivateActionButtonService } from '../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { combineLatest, filter, Observable, switchMap } from 'rxjs';
import { PrivateActionButtonState } from '../../shared-privacy-providers/models/private-action-button-state';
import { BlockchainName } from '@cryptorubic/core';
import { SwapAmount } from '../../shared-privacy-providers/models/swap-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PageType } from '../../shared-privacy-providers/components/page-navigation/models/page-type';
import { Web3Pure } from '@cryptorubic/web3';
import { isValidPrivateAddress } from '@hinkal/common';

@Injectable()
export class HinkalActionButtonService extends PrivateActionButtonService {
  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(Boolean),
      switchMap(page => {
        if (page.type === 'swap') {
          return combineLatest([
            this.walletConnector.networkChange$,
            this.privateSwapWindowService.swapInfo$,
            this._receiverAddress$
          ]).pipe(
            switchMap(([network, swapInfo, receiver]) => {
              return this.getButtonState(
                network,
                swapInfo.fromAsset,
                swapInfo.fromAmount,
                receiver,
                page,
                swapInfo.toAsset
              );
            })
          );
        }

        let asset$: Observable<BalanceToken>;
        let assetAmount$: Observable<SwapAmount>;

        if (page.type === 'transfer') {
          asset$ = this.privateTransferWindowService.transferAsset$;
          assetAmount$ = this.privateTransferWindowService.transferAmount$;
        }

        if (page.type === 'hide') {
          asset$ = this.hideWindowService.hideAsset$;
          assetAmount$ = this.hideWindowService.hideAmount$;
        }

        if (page.type === 'reveal') {
          asset$ = this.revealWindowService.revealAsset$;
          assetAmount$ = this.revealWindowService.revealAmount$;
        }

        return combineLatest([
          this.walletConnector.networkChange$,
          asset$,
          assetAmount$,
          this._receiverAddress$
        ]).pipe(switchMap(params => this.getButtonState(...params, page)));
      })
    );

  private async getButtonState(
    _network: BlockchainName | null,
    fromAsset: BalanceToken | null,
    assetAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null,
    receiver: string,
    currPage: PageType,
    toAsset?: BalanceToken | null
  ): Promise<PrivateActionButtonState> {
    if (!fromAsset) {
      return {
        type: 'error',
        text: 'Select token'
      };
    }

    if (currPage.type === 'swap') {
      if (!toAsset) {
        return {
          type: 'error',
          text: 'Select token'
        };
      }

      if (fromAsset.blockchain !== toAsset.blockchain) {
        return {
          type: 'error',
          text: 'Trade is not available'
        };
      }
    }

    if (
      !assetAmount ||
      isNaN(assetAmount.actualValue.toNumber()) ||
      assetAmount.actualValue.isZero()
    ) {
      return {
        type: 'error',
        text: 'Enter amount'
      };
    }

    if (!fromAsset.amount.isFinite() || fromAsset.amount.lt(assetAmount.visibleValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }

    if (currPage.type === 'transfer' && !receiver) {
      return {
        type: 'error',
        text: 'Enter receiver address'
      };
    }

    if (receiver) {
      const isAddressCorrect =
        currPage.type === 'transfer'
          ? isValidPrivateAddress(receiver)
          : await Web3Pure.getInstance(fromAsset.blockchain).isAddressCorrect(receiver);

      if (!isAddressCorrect) {
        return {
          type: 'error',
          text: 'Enter correct receiver address'
        };
      }
    }

    return {
      type: 'parent',
      text: currPage.label
    };
  }
}
