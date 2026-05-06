import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { map } from 'rxjs';

@Component({
  selector: 'app-login-window',
  templateUrl: './login-window.component.html',
  styleUrls: ['./login-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LoginWindowComponent {
  @Input({ required: true }) authorized: boolean;

  @Input({ required: true }) supportedWallets: WALLET_NAME[];

  @Input() loading: boolean = false;

  @Output() handleClick = new EventEmitter();

  public readonly currUser$ = this.authService.currentUser$;

  public readonly showConnectWallet$ = this.walletConnectorService.addressChange$.pipe(
    map(
      address =>
        !address ||
        !this.supportedWallets.includes(this.walletConnectorService.provider?.walletName)
    )
  );

  constructor(
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public onClick(): void {
    this.handleClick.emit();
  }
}
