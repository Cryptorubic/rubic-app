import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { Observable } from 'rxjs';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import { map } from 'rxjs/operators';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { PromotionService } from '@features/promotion/services/promotion.service';
import { PromotionStatistics } from '@features/promotion/models/promotion-statistics.interface';

@Component({
  selector: 'app-promotion-stats',
  templateUrl: './promotion-stats.component.html',
  styleUrls: ['./promotion-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionStatsComponent {
  public readonly faqLink = EXTERNAL_LINKS.LANDING_REFERRAL;

  public readonly contactUsLink = 'https://t.me/KirKuzmin';

  public readonly isWalletConnected$: Observable<boolean>;

  public readonly statistics$: Observable<PromotionStatistics>;

  public readonly isStatisticsLoading$: Observable<boolean>;

  constructor(
    authService: AuthService,
    private readonly walletsModalService: WalletsModalService,
    private readonly promotionService: PromotionService
  ) {
    this.isWalletConnected$ = authService.getCurrentUser().pipe(map(user => !!user?.address));
    this.statistics$ = promotionService.statistics$;
    this.isStatisticsLoading$ = promotionService.isStatisticsLoading$;
  }

  public openWalletsModal(): void {
    this.walletsModalService.open$();
  }

  public updateStatistics(): void {
    this.promotionService.updatePromotionStatistics();
  }
}
