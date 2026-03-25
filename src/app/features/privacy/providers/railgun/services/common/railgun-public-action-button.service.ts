import { inject, Injectable } from '@angular/core';
import { PrivateActionButtonState } from '@app/features/privacy/providers/shared-privacy-providers/models/private-action-button-state';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { combineLatest, combineLatestWith, filter, Observable, switchMap } from 'rxjs';
import { RailgunErrorService } from '@features/privacy/providers/railgun/services/common/railgun-error.service';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { AuthService } from '@core/services/auth/auth.service';
import { UserInterface } from '@core/services/auth/models/user.interface';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { map } from 'rxjs/operators';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { RailgunPublicAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-public-assets.service';

@Injectable()
export class RailgunPublicActionButtonService extends PrivateActionButtonService {
  private readonly errorService = inject(RailgunErrorService);

  private readonly railgunFacadeService = inject(RailgunFacadeService);

  private readonly authService = inject(AuthService);

  private readonly tokensFacade = inject(TokensFacadeService);

  private readonly toAssetsService = inject(RailgunPublicAssetsService);

  public override readonly buttonState$: Observable<PrivateActionButtonState> =
    this.privatePageTypeService.activePage$.pipe(
      filter(page => !!page),
      switchMap(page => {
        if (page.type === 'hide') {
          return combineLatest([
            this.walletConnector.networkChange$,
            this.hideWindowService.hideAsset$,
            this.hideWindowService.hideAmount$,
            this.railgunFacadeService.railgunAccount$,
            this.authService.currentUser$,
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
      })
    );

  private connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector, {
        providers: [WALLET_NAME.METAMASK, WALLET_NAME.WALLET_CONNECT]
      })
      .subscribe();
  }

  private async getShieldingState(
    network: BlockchainName | null,
    shieldAsset: BalanceToken | null,
    shieldAmount: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null,
    railgunWallet: { evmWalletAddress: string },
    user: UserInterface,
    totalBalanceToken: BalanceToken
  ): Promise<PrivateActionButtonState> {
    if (!network) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (user && !compareAddresses(railgunWallet.evmWalletAddress, user.address)) {
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
      text: 'Shield token'
    };
  }
}
