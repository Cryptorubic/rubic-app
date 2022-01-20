import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';

@Component({
  selector: 'app-promotion-page',
  templateUrl: './promotion-page.component.html',
  styleUrls: ['./promotion-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionPageComponent {
  public readonly $isWalletConnected: Observable<boolean>;

  constructor(authService: AuthService, private readonly walletsModalService: WalletsModalService) {
    this.$isWalletConnected = authService.getCurrentUser().pipe(map(user => !!user?.address));
  }

  public openWalletsModal(): void {
    this.walletsModalService.open$();
  }
}
