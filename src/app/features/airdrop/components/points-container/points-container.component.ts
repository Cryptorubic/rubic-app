import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { map } from 'rxjs/operators';
import { AirdropService } from '@features/airdrop/services/airdrop.service';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-points-container',
  templateUrl: './points-container.component.html',
  styleUrls: ['./points-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsContainerComponent {
  public readonly points$ = this.airdropService.points$;

  public readonly isLoggedIn$ = this.walletConnectorService.addressChange$.pipe(map(Boolean));

  public readonly currentUser$ = this.authService.currentUser$;

  public readonly buttonHint$ = this.points$.pipe(
    map(points => {
      if (points.requested_to_withdraw > 0 && !(points.confirmed >= 300)) {
        return 'The withdrawal is already in progress. Minimum withdrawal: 300 RBC.';
      }

      if (points.requested_to_withdraw === 0 && !(points.confirmed >= 300)) {
        return 'Minimum withdrawal: 300 RBC.';
      }

      return null;
    })
  );

  public readonly buttonText$ = this.points$.pipe(
    map(points => {
      if (points.requested_to_withdraw > 0 && !(points.confirmed >= 300)) {
        return 'Withdrawal has been requested';
      }

      if (points.requested_to_withdraw === 0 && !(points.confirmed >= 300)) {
        return 'Not Enough Points';
      }

      return 'Request withdrawal';
    })
  );

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly airdropService: AirdropService,
    private readonly authService: AuthService
  ) {}

  public async handleWithdraw(points: number, address: string): Promise<void> {
    await this.airdropService.claimPoints(points, address);
  }
}
