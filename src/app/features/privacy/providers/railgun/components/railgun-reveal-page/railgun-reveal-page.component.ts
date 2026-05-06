import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, inject, Input, DestroyRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BlockchainName } from '@cryptorubic/core';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { RailgunRevealFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-reveal-facade.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';
import { firstValueFrom } from 'rxjs';
import { PrivateEvent } from '@features/privacy/providers/shared-privacy-providers/models/private-event';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { RailgunSupportedChain } from '@features/privacy/providers/railgun/constants/network-map';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { PrivateStatisticsService } from '@features/privacy/providers/shared-privacy-providers/services/private-statistics/private-statistics.service';
import { AuthService } from '@core/services/auth/auth.service';
import { PrivateActionButtonService } from '@features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { RailgunPrivateActionButtonService } from '@features/privacy/providers/railgun/services/common/railgun-private-action-button.service';
import { TokensBalanceService } from '@core/services/tokens/tokens-balance.service';
import { RevealWindowService } from '@features/privacy/providers/shared-privacy-providers/services/reveal-window/reveal-window.service';

@Component({
  selector: 'app-railgun-reveal-page',
  templateUrl: './railgun-reveal-page.component.html',
  styleUrls: ['./railgun-reveal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    RailgunPrivateAssetsService,
    { provide: ToAssetsService, useExisting: RailgunPrivateAssetsService },
    { provide: TokensFacadeService, useClass: RailgunRevealFacadeService },
    RailgunPrivateActionButtonService,
    { provide: PrivateActionButtonService, useExisting: RailgunPrivateActionButtonService }
  ],
  standalone: false
})
export class RailgunRevealPageComponent {
  @Input({ required: true }) public readonly railgunId: string;

  @Input({ required: true }) balances: Record<
    RailgunSupportedChain,
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null
  >;

  private readonly privateStatisticsService = inject(PrivateStatisticsService);

  public readonly receiverCtrl = new FormControl<string>('');

  private readonly revealService = inject(RevealService);

  private readonly notificationService = inject(NotificationsService);

  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly toAssetsService = inject(ToAssetsService) as RailgunPrivateAssetsService;

  private readonly authService = inject(AuthService);

  private readonly windowService = inject(RevealWindowService);

  private readonly tokensBalanceService = inject(TokensBalanceService);

  ngOnInit() {
    this.railgunFacade.completedChains$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(chains => this.toAssetsService.setBlockchainList(chains));
  }

  public async reveal(params: PrivateEvent): Promise<void> {
    const { balanceToken, token, loadingCallback, openPreview } = params;
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Unshield',
            action: async () => {
              const bigintAmount = BigInt(token.stringWeiAmount);
              this.notificationService.show('This may take a moment. Please keep Rubic App open', {
                appearance: 'info',
                autoClose: 10_000,
                data: null
              });
              await this.revealService.unshield(
                token.address,
                bigintAmount.toString(),
                () => {},
                token.blockchain as RailgunSupportedChain
              );
              this.notificationService.show(
                'Tokens were successfully unshielded to public wallet',
                {
                  appearance: 'success',
                  autoClose: 5_000,
                  data: null
                }
              );
              this.privateStatisticsService.saveAction(
                'UNSHIELD',
                'RAILGUN',
                this.authService.userAddress,
                token.address,
                token.weiAmount.toFixed(),
                token.blockchain
              );
              this.windowService.setRevealAsset({
                ...balanceToken,
                amount: balanceToken.amount.minus(token.tokenAmount)
              });
              setTimeout(async () => {
                const wallet = await firstValueFrom(this.railgunFacade.railgunAccount$);
                this.railgunFacade.refreshBalances(
                  [wallet.id],
                  [token.blockchain as RailgunSupportedChain]
                );
              }, 10_000);
            }
          }
        ],
        swapType: 'unshield',
        dstTokenAmount: token.tokenAmount.multipliedBy(1 - 0.0025).toFixed(),
        hideFeeInfo: true
      });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }

  readonly destroyRef = inject(DestroyRef);
}
