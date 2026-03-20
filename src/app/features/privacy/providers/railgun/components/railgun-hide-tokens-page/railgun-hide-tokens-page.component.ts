import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HideService } from '@features/privacy/providers/railgun/services/hide/hide.service';
import { FromAssetsService } from '@features/trade/components/assets-selector/services/from-assets.service';
import { RailgunPublicAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-public-assets.service';
import { PrivateEvent } from '@features/privacy/providers/shared-privacy-providers/models/private-event';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { distinctUntilKeyChanged, firstValueFrom, takeUntil } from 'rxjs';
import { fromRubicToPrivateChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { ShieldedBalanceToken } from '@features/privacy/providers/shared-privacy-providers/components/shielded-tokens-list/models/shielded-balance-token';
import { StoreService } from '@core/services/store/store.service';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { HideWindowService } from '@features/privacy/providers/shared-privacy-providers/services/hide-window-service/hide-window.service';
import { Web3Pure } from '@cryptorubic/web3';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-railgun-hide-tokens-page',
  templateUrl: './railgun-hide-tokens-page.component.html',
  styleUrls: ['./railgun-hide-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: RailgunPublicAssetsService },
    TuiDestroyService
  ]
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

  private readonly destroy$ = inject(TuiDestroyService);

  constructor() {
    this.hideWindowService.hideAsset$
      .pipe(distinctUntilKeyChanged('symbol'), takeUntil(this.destroy$))
      .subscribe(token => {
        const isNative = Web3Pure.isNativeAddress(token.blockchain, token.address);
        if (isNative) {
          this.notificationService.show(
            `This transaction will automatically wrap your ${token.symbol} into W${token.symbol} (1:1) and shield the wrapped tokens in RAILGUN.`,
            {
              label: 'RAILGUN does not support shielding native tokens',
              status: 'info',
              autoClose: 10_000,
              data: null,
              icon: 'info',
              defaultAutoCloseTime: 0
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
            label: 'Shield Tokens',
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
              this.notificationService.show(
                'Waiting for your Private Proof of Innocence. Estimated time 1 hour. Come back soon.',
                {
                  status: 'info',
                  autoClose: 15_000,
                  data: null,
                  icon: '',
                  defaultAutoCloseTime: 0
                }
              );
            }
          }
        ],
        swapType: 'shield',
        dstTokenAmount: token.tokenAmount.multipliedBy(1 - 0.0025).toFixed()
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }

  private setShieldedToken(token: BalanceToken): void {
    const shieldToken: ShieldedBalanceToken = {
      ...token,
      shieldingCompleteAtMs: new Date(Date.now() + 3600000).toLocaleTimeString()
    };
    const alreadyShielded = this.storeService.getItem('RAILGUN_SHIELDED_TOKENS') || [];
    const newShielded = [...alreadyShielded, shieldToken];
    this.storeService.setItem('RAILGUN_SHIELDED_TOKENS', newShielded);
    this.railgunFacadeService.setShieldedTokens(newShielded);
  }
}
