import { inject, Injectable } from '@angular/core';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { ErrorInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { combineLatest, combineLatestWith, filter, Observable, switchMap } from 'rxjs';
import { RailgunErrorService } from '@features/privacy/providers/railgun/services/common/railgun-error.service';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { map } from 'rxjs/operators';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { CommonWalletAdapter } from '@app/core/services/wallets/wallets-adapters/common-wallet-adapter';
import { Web3Pure } from '@cryptorubic/web3';

@Injectable()
export class RailgunPrivateActionButtonService extends PrivateActionButtonService {
  private readonly errorService = inject(RailgunErrorService);

  private readonly railgunFacadeService = inject(RailgunFacadeService);

  private readonly tokensFacade = inject(TokensFacadeService);

  private readonly toAssetsService = inject(RailgunPrivateAssetsService);

  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(page => !!page),
      switchMap(page => {
        if (page.type === 'hide') {
          return combineLatest([
            this.hideWindowService.hideAsset$,
            this.hideWindowService.hideAmount$,
            this.railgunFacadeService.railgunAccount$,
            this.walletConnector.activeWallets$,
            this.hideWindowService.hideAsset$.pipe(
              combineLatestWith(
                this.tokensFacade.tokens$,
                this.toAssetsService.assetListType$.pipe(
                  switchMap(type => this.tokensFacade.getTokensBasedOnType(type).balanceLoading$),
                  filter(loading => !loading)
                )
              ),
              filter(() => !!this.tokensFacade.tokens),
              map(([fromToken]) => {
                const foundToken = this.tokensFacade.tokens.find(token =>
                  compareTokens(fromToken, token)
                );
                return { ...foundToken, amount: fromToken?.amount };
              })
            )
          ]).pipe(switchMap(params => this.getShieldingState(...params)));
        }
        if (page.type === 'transfer') {
          return combineLatest([
            this.privateTransferWindowService.transferAsset$,
            this.privateTransferWindowService.transferAmount$,
            this._receiverAddress$,
            this.errorService.tradeError$,
            this.railgunFacadeService.railgunAccount$,
            this.walletConnector.activeWallets$,
            this.privateTransferWindowService.transferAsset$.pipe(
              combineLatestWith(
                this.tokensFacade.tokens$,
                this.toAssetsService.assetListType$.pipe(
                  switchMap(type => this.tokensFacade.getTokensBasedOnType(type).balanceLoading$),
                  filter(loading => !loading)
                )
              ),
              filter(() => !!this.tokensFacade.tokens),
              map(([fromToken]) => {
                const foundToken = this.tokensFacade.tokens.find(token =>
                  compareTokens(fromToken, token)
                );
                return { ...foundToken, amount: fromToken?.amount };
              })
            )
          ]).pipe(switchMap(params => this.getTransferState(...params)));
        }
        if (page.type === 'reveal') {
          return combineLatest([
            this.revealWindowService.revealAsset$,
            this.revealWindowService.revealAmount$,
            this.railgunFacadeService.railgunAccount$,
            this.walletConnector.activeWallets$,
            this._receiverAddress$,
            this.revealWindowService.revealAsset$.pipe(
              combineLatestWith(
                this.tokensFacade.tokens$,
                this.toAssetsService.assetListType$.pipe(
                  switchMap(type => this.tokensFacade.getTokensBasedOnType(type).balanceLoading$),
                  filter(loading => !loading)
                )
              ),
              filter(() => !!this.tokensFacade.tokens),
              map(([fromToken]) => {
                const foundToken = this.tokensFacade.tokens.find(token =>
                  compareTokens(fromToken, token)
                );
                return { ...foundToken, amount: fromToken?.amount };
              })
            )
          ]).pipe(switchMap(params => this.getUnshieldingState(...params)));
        }
      })
    );

  protected connectWallet(): void {
    super.connectWallet();
    this.modalService
      .openNewWalletModal(this.injector, {
        providers: [WALLET_NAME.METAMASK, WALLET_NAME.WALLET_CONNECT]
      })
      .subscribe();
  }

  private async getShieldingState(
    shieldAsset: BalanceToken | null,
    shieldAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null,
    railgunWallet: { evmWalletAddress: string },
    _activeWallets: CommonWalletAdapter[],
    totalBalanceToken: BalanceToken
  ): Promise<PrivateActionButtonState> {
    const walletAddr = this.walletConnector.getActiveWalletAddress({
      blockchain: shieldAsset.blockchain
    });
    if (!walletAddr) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (!compareAddresses(railgunWallet?.evmWalletAddress, walletAddr)) {
      return {
        type: 'error',
        text: 'Switch to your seed phrase wallet'
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

    if (totalBalanceToken.amount.lt(shieldAmount.actualValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }
    return {
      type: 'parent',
      text: 'Shield Tokens'
    };
  }

  private async getUnshieldingState(
    unshieldAsset: BalanceToken | null,
    unshieldAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null,
    railgunWallet: { evmWalletAddress: string },
    _activeWallets: CommonWalletAdapter[],
    receiver: string,
    totalBalanceToken: BalanceToken
  ): Promise<PrivateActionButtonState> {
    const walletAddr = this.walletConnector.getActiveWalletAddress({
      blockchain: unshieldAsset.blockchain
    });
    if (!walletAddr) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (!compareAddresses(railgunWallet?.evmWalletAddress, walletAddr)) {
      return {
        type: 'error',
        text: 'Switch to your seed phrase wallet'
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
    if (totalBalanceToken.amount.lt(unshieldAmount.actualValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }

    if (receiver) {
      const isAddressCorrect = await Web3Pure.getInstance(
        unshieldAsset.blockchain
      ).isAddressCorrect(receiver);

      if (!isAddressCorrect) {
        return {
          type: 'error',
          text: 'Enter correct receiver address'
        };
      }

      if (compareAddresses(walletAddr, receiver)) {
        return {
          type: 'error',
          text: 'Recipient address must be different'
        };
      }
    } else {
      return {
        type: 'error',
        text: 'Enter receiver address'
      };
    }

    return {
      type: 'parent',
      text: 'Private Transfer'
    };
  }

  private async getTransferState(
    transferAsset: BalanceToken | null,
    transferAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null,
    _receiver: string,
    tradeError: ErrorInterface,
    railgunWallet: { evmWalletAddress: string },
    _activeWallets: CommonWalletAdapter[],
    totalBalanceToken: BalanceToken
  ): Promise<PrivateActionButtonState> {
    const walletAddr = this.walletConnector.getActiveWalletAddress({
      blockchain: transferAsset.blockchain
    });
    if (!walletAddr) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (!compareAddresses(railgunWallet.evmWalletAddress, walletAddr)) {
      return {
        type: 'error',
        text: 'Switch to your seed phrase wallet'
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
    if (totalBalanceToken.amount.lt(transferAmount.actualValue)) {
      return {
        type: 'error',
        text: 'Insufficient balance'
      };
    }
    return {
      type: 'parent',
      text: 'Transfer'
    };
  }
}
