import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { map } from 'rxjs/operators';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { AuthService } from '@core/services/auth/auth.service';
import { Points } from '@features/swap-and-earn/models/points';

@Component({
  selector: 'app-points-container',
  templateUrl: './points-container.component.html',
  styleUrls: ['./points-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsContainerComponent {
  @Input() public readonly points: Points;

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
    if (this.points.requested_to_withdraw > 0 && !(this.points.confirmed >= 2500)) {
      return 'The withdrawal is already in progress. The minimum amount to withdraw is 2,500 RBC.';
    }

    if (this.points.requested_to_withdraw === 0 && !(this.points.confirmed >= 2500)) {
      return 'The minimum amount to withdraw is 2,500 RBC.';
    }

    return null;
  }

  public getButtonText(): string {
    if (this.points.requested_to_withdraw > 0 && !(this.points.confirmed >= 2500)) {
      return 'Claimed';
    }

    if (this.points.requested_to_withdraw === 0 && !(this.points.confirmed >= 2500)) {
      return 'Not Enough Points';
    }

    return 'Withdraw Points';
  }
}
