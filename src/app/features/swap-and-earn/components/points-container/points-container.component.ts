import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { map } from 'rxjs/operators';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

@Component({
  selector: 'app-points-container',
  templateUrl: './points-container.component.html',
  styleUrls: ['./points-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsContainerComponent {
  // @Input() public readonly points: Points;

  @Output() public readonly handleClick = new EventEmitter<void>();

  public readonly points$ = this.swapAndEarnStateService.points$;

  public readonly isLoggedIn$ = this.walletConnectorService.addressChange$.pipe(map(Boolean));

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly swapAndEarnStateService: SwapAndEarnStateService
  ) {}

  public handleButtonClick(): void {
    this.handleClick.emit();
  }
}
