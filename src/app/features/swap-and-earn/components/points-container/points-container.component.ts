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
  ) {
    console.log(this.points);
  }

  public handleButtonClick(points: number): void {
    this.handleClick.emit(points);
  }
}
