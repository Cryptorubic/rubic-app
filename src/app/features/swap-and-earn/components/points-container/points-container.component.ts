import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { map } from 'rxjs/operators';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { AuthService } from '@core/services/auth/auth.service';
import { SwapToEarnUserPointsInfo } from '@features/swap-and-earn/models/swap-to-earn-user-info';

@Component({
  selector: 'app-points-container',
  templateUrl: './points-container.component.html',
  styleUrls: ['./points-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsContainerComponent {
  @Input() public readonly points: SwapToEarnUserPointsInfo;

  @Output() public readonly handleClick = new EventEmitter<number>();

  public readonly isLoggedIn$ = this.walletConnectorService.addressChange$.pipe(map(Boolean));

  public readonly currentUser$ = this.authService.currentUser$;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly swapAndEarnStateService: SwapAndEarnStateService,
    private readonly authService: AuthService
  ) {}

  public handleButtonClick(points: number): void {
    this.handleClick.emit(points);
  }

  public getButtonHint(): string {
    if (this.points.requested_to_withdraw > 0 && !(this.points.confirmed >= 300)) {
      return 'The withdrawal is already in progress. Minimum withdrawal: 300 RBC.';
    }

    if (this.points.requested_to_withdraw === 0 && !(this.points.confirmed >= 300)) {
      return 'Minimum withdrawal: 300 RBC.';
    }

    return null;
  }

  public getButtonText(): string {
    if (this.points.requested_to_withdraw > 0 && !(this.points.confirmed >= 300)) {
      return 'Withdrawal has been requested';
    }

    if (this.points.requested_to_withdraw === 0 && !(this.points.confirmed >= 300)) {
      return 'Not Enough Points';
    }

    return 'Request withdrawal';
  }
}
