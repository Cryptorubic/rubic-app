import { inject, Injectable } from '@angular/core';
import { PrivateActionButtonService } from '../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { combineLatest, filter, Observable, switchMap } from 'rxjs';
import { PrivateActionButtonState } from '../../shared-privacy-providers/models/private-action-button-state';
import { BlockchainName, BlockchainsInfo, CHAIN_TYPE, compareAddresses } from '@cryptorubic/core';
import { SwapAmount } from '../../shared-privacy-providers/models/swap-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PageType } from '../../shared-privacy-providers/components/page-navigation/models/page-type';
import { Web3Pure } from '@cryptorubic/web3';
import { isValidPrivateAddress } from '@hinkal/common';
import { HinkalInstanceService } from './hinkal-sdk/hinkal-instance.service';
import { HinkalFacadeService } from './hinkal-sdk/hinkal-facade.service';
import { HINKAL_SUPPORTED_WALLETS } from '../constants/hinkal-supported-wallets';

@Injectable()
export class HinkalActionButtonService extends PrivateActionButtonService {
  private readonly hinkalFacadeService = inject(HinkalFacadeService);

  private readonly hinkalInstanceService = inject(HinkalInstanceService);

  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(Boolean),
      switchMap(page => {
        if (page.type === 'swap') {
          return combineLatest([
            this.walletConnector.networkChange$,
            this.walletConnector.addressChange$,
            this.privateSwapWindowService.swapInfo$,
            this._receiverAddress$,
            this.hinkalInstanceService.currSignature$
          ]).pipe(
            switchMap(([network, userAddr, swapInfo, receiver, currSignature]) => {
              return this.getButtonState(
                network,
                userAddr,
                swapInfo.fromAsset,
                swapInfo.fromAmount,
                receiver,
                currSignature,
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
          this.walletConnector.addressChange$,
          asset$,
          assetAmount$,
          this._receiverAddress$,
          this.hinkalInstanceService.currSignature$
        ]).pipe(switchMap(params => this.getButtonState(...params, page)));
      })
    );

  protected connectWallet(): void {
    super.connectWallet();
    this.modalService
      .openWalletModal(this.injector, { providers: HINKAL_SUPPORTED_WALLETS })
      .subscribe();
  }

  private async getButtonState(
    network: BlockchainName | null,
    userAddr: string | null,
    fromAsset: BalanceToken | null,
    assetAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null,
    receiver: string,
    userSignature: string | null,
    currPage: PageType,
    toAsset?: BalanceToken | null
  ): Promise<PrivateActionButtonState> {
    if (!network) {
      return {
        type: 'action',
        text: 'Connect Wallet',
        action: () => this.connectWallet()
      };
    }

    if (BlockchainsInfo.getChainType(network) !== CHAIN_TYPE.EVM) {
      return {
        type: 'action',
        text: 'Switch Wallet',
        action: () => this.connectWallet()
      };
    }

    if (!userSignature) {
      return {
        type: 'action',
        text: 'Login',
        action: () => this.hinkalFacadeService.updateInstance()
      };
    }

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

    if (!fromAsset.amount?.isFinite() || fromAsset.amount.lt(assetAmount?.actualValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }

    if (currPage.type !== 'hide' && !receiver) {
      return {
        type: 'error',
        text: 'Enter receiver address'
      };
    }

    if (compareAddresses(userAddr, receiver)) {
      return {
        type: 'error',
        text: 'Please enter a different wallet as the receiver.'
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
