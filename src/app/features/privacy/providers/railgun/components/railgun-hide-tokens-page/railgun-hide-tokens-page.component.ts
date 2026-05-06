import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HideService } from '@features/privacy/providers/railgun/services/hide/hide.service';
import { FromAssetsService } from '@features/trade/components/assets-selector/services/from-assets.service';
import { RailgunPublicAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-public-assets.service';
import { PrivateEvent } from '@features/privacy/providers/shared-privacy-providers/models/private-event';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { distinctUntilKeyChanged, firstValueFrom } from 'rxjs';
import { fromRubicToPrivateChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { ShieldedBalanceToken } from '@features/privacy/providers/shared-privacy-providers/components/shielded-tokens-list/models/shielded-balance-token';
import { StoreService } from '@core/services/store/store.service';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { HideWindowService } from '@features/privacy/providers/shared-privacy-providers/services/hide-window-service/hide-window.service';
import { Web3Pure } from '@cryptorubic/web3';
import { filter } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { PrivateStatisticsService } from '@features/privacy/providers/shared-privacy-providers/services/private-statistics/private-statistics.service';
import { PrivateActionButtonService } from '@features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { RailgunPublicActionButtonService } from '@features/privacy/providers/railgun/services/common/railgun-public-action-button.service';
import { RailgunHideFacadeService } from '@features/privacy/providers/railgun/services/railgun-hide-facade.service';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';

@Component({
  selector: 'app-railgun-hide-tokens-page',
  templateUrl: './railgun-hide-tokens-page.component.html',
  styleUrls: ['./railgun-hide-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    RailgunPublicAssetsService,
    { provide: FromAssetsService, useExisting: RailgunPublicAssetsService },
    { provide: PrivateActionButtonService, useClass: RailgunPublicActionButtonService },
    { provide: TokensFacadeService, useExisting: RailgunHideFacadeService }
  ],
  standalone: false
})
export class RailgunHideTokensPageComponent {
  @Input({ required: true }) public readonly railgunWalletAddress: string;

  @Input({ required: true }) public readonly pendingBalances: ShieldedBalanceToken[] = [];

  private readonly railgunFacadeService = inject(RailgunFacadeService);

  public readonly receiverCtrl = new FormControl<string>('');

  private readonly hideService = inject(HideService);

  private readonly notificationService = inject(NotificationsService);

  private readonly storeService = inject(StoreService);

  private readonly hideWindowService = inject(HideWindowService);

  private readonly authService = inject(AuthService);

  private readonly privateStatisticsService = inject(PrivateStatisticsService);

  constructor() {
    this.hideWindowService.hideAsset$
      .pipe(filter(Boolean), distinctUntilKeyChanged('symbol'), takeUntilDestroyed())
      .subscribe(token => {
        const isNative = Web3Pure.isNativeAddress(token.blockchain, token.address);
        if (isNative) {
          this.notificationService.show(
            `This transaction will automatically wrap your ${token.symbol} into W${token.symbol} (1:1) and shield the wrapped tokens in RAILGUN.`,
            {
              label: 'RAILGUN does not support shielding native tokens',
              appearance: 'info',
              autoClose: 10_000,
              data: null,
              icon: 'info'
            }
          );
        }
      });
  }

  public async hide({
    token,
    balanceToken,
    loadingCallback,
    openPreview
  }: PrivateEvent): Promise<void> {
    // const gasInfo: AppGasData = { amount, amountInUsd, symbol: token.symbol };
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Shield',
            action: async () => {
              const bigintAmount = BigInt(token.stringWeiAmount);
              await this.hideService.shield(
                this.railgunWalletAddress,
                token.address,
                bigintAmount,
                {
                  network: fromRubicToPrivateChainMap[token.blockchain]
                }
              );
              this.setShieldedToken({ ...balanceToken, amount: token.tokenAmount });
              this.privateStatisticsService.saveAction(
                'SHIELD',
                'RAILGUN',
                this.authService.userAddress,
                token.address,
                token.weiAmount.toFixed(),
                token.blockchain
              );
              this.notificationService.show(
                'Waiting for your Private Proof of Innocence. Estimated time 1 hour. Come back soon.',
                {
                  appearance: 'info',
                  autoClose: 15_000,
                  data: null
                }
              );
            }
          }
        ],
        swapType: 'shield',
        dstTokenAmount: token.tokenAmount.multipliedBy(1 - 0.0025).toFixed(),
        hideFeeInfo: true
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }

  private setShieldedToken(token: BalanceToken): void {
    const shieldToken: ShieldedBalanceToken = {
      ...token,
      shieldingCompleteAtMs: Date.now() + 3600000
    };
    const storeInfo = this.storeService.getItem('RAILGUN_SHIELDED_TOKENS');
    const userInfo = storeInfo?.[this.authService.userAddress];
    const newShielded = [shieldToken, ...(userInfo || [])];
    const newInfo = { ...(storeInfo || {}), [this.authService.userAddress]: newShielded };

    this.storeService.setItem('RAILGUN_SHIELDED_TOKENS', newInfo);
    this.railgunFacadeService.setShieldedTokens(newShielded);
  }
}
