import { ChangeDetectionStrategy, Component, Inject, Injector, Input } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TuiAppearance } from '@taiga-ui/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { Router } from '@angular/router';
import { PRIVATE_MODE_URLS } from '@app/features/privacy/models/routes';
import { PRIVACYCASH_SUPPORTED_WALLETS } from '@app/features/privacy/providers/privacycash/constants/wallets';
import { PROVIDERS_LIST } from '@app/core/wallets-modal/components/wallets-modal/models/providers';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';

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
    @Inject(Injector) private readonly injector: Injector,
    private readonly router: Router
  ) {}

  public showModal(): void {
    const wallets = this.filterWallets();
    this.gtmService.fireClickOnConnectWalletButtonEvent();
    this.modalService.openWalletModal(this.injector, { providers: wallets }).subscribe();
  }

  private filterWallets(): WALLET_NAME[] {
    const wallets = this.router.url.includes(PRIVATE_MODE_URLS.PRIVACY_CASH)
      ? PRIVACYCASH_SUPPORTED_WALLETS
      : PROVIDERS_LIST.map(provider => provider.value);
    return wallets;
  }
}
