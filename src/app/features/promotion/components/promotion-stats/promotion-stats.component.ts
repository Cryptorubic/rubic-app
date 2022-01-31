import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { Observable } from 'rxjs';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import { map } from 'rxjs/operators';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';

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

  constructor(authService: AuthService, private readonly walletsModalService: WalletsModalService) {
    this.isWalletConnected$ = authService.getCurrentUser().pipe(map(user => !!user?.address));
  }

  public openWalletsModal(): void {
    this.walletsModalService.open$();
  }
}
