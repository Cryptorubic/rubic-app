import { inject, Injectable } from '@angular/core';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { combineLatest, combineLatestWith, EMPTY, filter, Observable, switchMap } from 'rxjs';
import { RailgunErrorService } from '@features/privacy/providers/railgun/services/common/railgun-error.service';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { map } from 'rxjs/operators';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { RailgunPublicAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-public-assets.service';
import {
  PRIVATE_PROVIDERS_MOBILE_WALLETS_MAP,
  PRIVATE_PROVIDERS_WALLETS_MAP
} from '@features/privacy/constants/private-providers-wallets-map';
import { HeaderStore } from '@core/header/services/header.store';
import { CommonWalletAdapter } from '@app/core/services/wallets/wallets-adapters/common-wallet-adapter';

@Injectable()
export class RailgunPublicActionButtonService extends PrivateActionButtonService {
  private readonly errorService = inject(RailgunErrorService);

  private readonly railgunFacadeService = inject(RailgunFacadeService);

  private readonly tokensFacade = inject(TokensFacadeService);

  private readonly toAssetsService = inject(RailgunPublicAssetsService);

  private readonly headerStore = inject(HeaderStore);

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

        return EMPTY;
      })
    );

  protected connectWallet(): void {
    super.connectWallet();
    const walletsMap = this.headerStore.isMobile
      ? PRIVATE_PROVIDERS_MOBILE_WALLETS_MAP
      : PRIVATE_PROVIDERS_WALLETS_MAP;
    this.modalService
      .openWalletModal(this.injector, {
        providers: walletsMap['railgun']
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
    if (!compareAddresses(railgunWallet.evmWalletAddress, walletAddr)) {
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
}
