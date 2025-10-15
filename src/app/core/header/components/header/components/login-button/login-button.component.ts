import { ChangeDetectionStrategy, Component, Inject, Injector, Input } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TuiAppearance } from '@taiga-ui/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginButtonComponent {
  public currentUser$ = this.authService.currentUser$;

  @Input() appearance: TuiAppearance | string = 'primary';

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly gtmService: GoogleTagManagerService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public showModal(): void {
    this.gtmService.fireClickOnConnectWalletButtonEvent();
    this.authService.connectWallet({ walletName: WALLET_NAME.WEB3AUTH });
    // this.modalService.openWalletModal(this.injector).subscribe();
  }
}
