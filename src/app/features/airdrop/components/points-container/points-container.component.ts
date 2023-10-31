import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { map } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { AirdropPointsService } from '@shared/services/airdrop-points-service/airdrop-points.service';
import { AirdropUserPointsInfo } from '@features/airdrop/models/airdrop-user-info';

@Component({
  selector: 'app-points-container',
  templateUrl: './points-container.component.html',
  styleUrls: ['./points-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsContainerComponent {
  public readonly points$ = this.airdropPointsService.points$;

  public readonly isLoggedIn$ = this.walletConnectorService.addressChange$.pipe(map(Boolean));

  public readonly currentUser$ = this.authService.currentUser$;

  public readonly buttonHint$ = this.points$.pipe(
    map(points => {
      if (points.requested_to_withdraw > 0 && points.confirmed <= 300) {
        return 'The withdrawal is already in progress. Minimum withdrawal: 300 RBC.';
      }

      if (points.requested_to_withdraw === 0 && points.confirmed <= 300) {
        return 'Minimum withdrawal: 300 RBC.';
      }

      return null;
    })
  );

  public readonly buttonText$ = this.points$.pipe(
    map(points => {
      if (points.requested_to_withdraw > 0 && points.confirmed <= 300) {
        return 'Withdrawal has been requested';
      }

      if (points.requested_to_withdraw === 0 && points.confirmed <= 300) {
        return 'Not Enough Points';
      }

      return 'Request withdrawal';
    })
  );

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly airdropPointsService: AirdropPointsService,
    private readonly authService: AuthService
  ) {}

  public async handleWithdraw(points: AirdropUserPointsInfo, address: string): Promise<void> {
    await this.airdropPointsService.claimPoints(points.confirmed, address);
  }
}
