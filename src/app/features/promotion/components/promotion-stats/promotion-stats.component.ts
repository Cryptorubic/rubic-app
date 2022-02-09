import { Component, ChangeDetectionStrategy, OnInit, Self } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { Observable } from 'rxjs';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import { map, takeUntil } from 'rxjs/operators';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { PromotionService } from '@features/promotion/services/promotion.service';
import { PromotionStatistics } from '@features/promotion/models/promotion-statistics.interface';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { ErrorsService } from '@core/errors/errors.service';
import { WrongWalletError } from '@core/errors/models/promotion/wrong-wallet.error';

/**
 * Block with promotion statistics and referral link.
 */
@Component({
  selector: 'app-promotion-stats',
  templateUrl: './promotion-stats.component.html',
  styleUrls: ['./promotion-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class PromotionStatsComponent implements OnInit {
  public readonly faqLink = EXTERNAL_LINKS.LANDING_REFERRAL;

  public readonly contactUsLink = 'https://t.me/KirKuzmin';

  public readonly isWalletConnected$: Observable<boolean>;

  public readonly isEthLikeWalletConnected$: Observable<boolean>;

  public readonly statistics$: Observable<PromotionStatistics>;

  public readonly isStatisticsLoading$: Observable<boolean>;

  public readonly promoLink$: Observable<string>;

  public readonly isPromoLinkLoading$: Observable<boolean>;

  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService,
    private readonly promotionService: PromotionService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly errorsService: ErrorsService
  ) {
    this.isWalletConnected$ = authService.getCurrentUser().pipe(map(user => !!user?.address));
    this.isEthLikeWalletConnected$ = authService
      .getCurrentUser()
      .pipe(
        map(
          user => !!user?.address && this.walletConnectorService.provider.walletType === 'ethLike'
        )
      );

    this.statistics$ = promotionService.statistics$;
    this.isStatisticsLoading$ = promotionService.isStatisticsLoading$;
    this.promoLink$ = promotionService.promoLink$;
    this.isPromoLinkLoading$ = promotionService.isPromoLinkLoading$;
  }

  ngOnInit(): void {
    this.isWalletConnected$.pipe(takeUntil(this.destroy$)).subscribe(isAuthorized => {
      const isNotEthLikeWallet =
        isAuthorized && this.walletConnectorService.provider.walletType !== 'ethLike';
      if (isNotEthLikeWallet) {
        this.errorsService.catch(new WrongWalletError());
      }
    });
  }

  public openWalletsModal(): void {
    this.walletsModalService.open$();
  }

  public reconnectWallet(): void {
    this.authService.serverlessSignOut();
    this.openWalletsModal();
  }

  public updateStatistics(): void {
    this.promotionService.updatePromotionStatistics();
  }
}
