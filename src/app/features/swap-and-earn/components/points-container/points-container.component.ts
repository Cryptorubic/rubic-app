import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Points } from '@features/swap-and-earn/models/points';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-points-container',
  templateUrl: './points-container.component.html',
  styleUrls: ['./points-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointsContainerComponent {
  @Input() public readonly points: Points;

  @Output() public readonly handleClick = new EventEmitter<void>();

  public readonly isLoggedIn$ = this.walletConnectorService.addressChange$.pipe(map(Boolean));

  constructor(private readonly walletConnectorService: WalletConnectorService) {}

  public handleButtonClick(): void {
    debugger;
    this.handleClick.emit();
  }
}
