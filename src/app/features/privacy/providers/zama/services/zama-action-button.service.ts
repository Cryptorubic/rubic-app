import { inject, Injectable } from '@angular/core';
import { PrivateActionButtonService } from '../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { combineLatest, filter, Observable, switchMap } from 'rxjs';
import { PrivateActionButtonState } from '../../shared-privacy-providers/models/private-action-button-state';
import { compareAddresses } from '@cryptorubic/core';
import { SwapAmount } from '../../shared-privacy-providers/models/swap-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PageType } from '../../shared-privacy-providers/components/page-navigation/models/page-type';
import { Web3Pure } from '@cryptorubic/web3';
import { ZAMA_SUPPORTED_WALLETS } from '../constants/zama-supported-wallets';
import { ZamaSignatureService } from './zama-sdk/zama-signature.service';
import { SignatureInfo } from './zama-sdk/models/signature-info';
import { ZamaFacadeService } from './zama-sdk/zama-facade.service';
import { CommonWalletAdapter } from '@app/core/services/wallets/wallets-adapters/common-wallet-adapter';

@Injectable()
export class ZamaActionButtonService extends PrivateActionButtonService {
  private readonly signatureService = inject(ZamaSignatureService);

  private readonly zamaFacade = inject(ZamaFacadeService);

  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(Boolean),
      switchMap(page => {
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
          this.walletConnector.activeWallets$,
          asset$,
          assetAmount$,
          this._receiverAddress$,
          this.signatureService.signatureInfo$
        ]).pipe(switchMap(params => this.getButtonState(...params, page)));
      })
    );

  protected connectWallet(): void {
    super.connectWallet();
    this.modalService
      .openWalletModal(this.injector, { providers: ZAMA_SUPPORTED_WALLETS })
      .subscribe();
  }

  private async getButtonState(
    activeWallets: CommonWalletAdapter[],
    asset: BalanceToken | null,
    assetAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null,
    receiver: string,
    signatureInfo: SignatureInfo | null,
    currPage: PageType
  ): Promise<PrivateActionButtonState> {
    if (!activeWallets.length) {
      return {
        type: 'action',
        text: 'Connect Wallet',
        action: () => this.connectWallet()
      };
    }
    const evmWalletAdapter = this.walletConnector.getActiveProvider({ chainType: 'EVM' });

    if (!evmWalletAdapter) {
      return {
        type: 'action',
        text: 'Switch Wallet',
        action: () => this.connectWallet()
      };
    }

    if (!signatureInfo) {
      return {
        type: 'action',
        text: 'Sign to enable Private Mode',
        action: () => this.zamaFacade.updateSignature()
      };
    }

    if (!asset) {
      return {
        type: 'error',
        text: 'Select token'
      };
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

    if (asset.amount.lt(assetAmount.visibleValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }

    if (currPage.type === 'hide' && assetAmount.actualValue.lt('0.000001')) {
      return {
        type: 'error',
        text: `Min amount is 0.000001 ${asset.symbol}`
      };
    }

    if (currPage.type === 'transfer' && !receiver) {
      return {
        type: 'error',
        text: 'Enter receiver address'
      };
    }

    if (receiver) {
      const isAddressCorrect = await Web3Pure.getInstance(asset.blockchain).isAddressCorrect(
        receiver
      );

      if (!isAddressCorrect) {
        return {
          type: 'error',
          text: 'Enter correct receiver address'
        };
      }

      if (compareAddresses(evmWalletAdapter.address, receiver) && currPage.type === 'transfer') {
        return {
          type: 'error',
          text: 'Recipient address must be different'
        };
      }
    }

    return {
      type: 'parent',
      text: currPage.label
    };
  }
}
