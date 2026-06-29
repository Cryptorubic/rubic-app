import { ChangeDetectionStrategy, Component, inject, Inject, Injector, Input } from '@angular/core';
import { TuiAppearance } from '@taiga-ui/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { Router } from '@angular/router';
import { PROVIDERS_LIST } from '@app/core/wallets-modal/components/wallets-modal/models/providers';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import {
  PRIVATE_PROVIDERS_MOBILE_WALLETS_MAP,
  PRIVATE_PROVIDERS_WALLETS_MAP
} from '@app/features/privacy/constants/private-providers-wallets-map';
import { HeaderStore } from '@core/header/services/header.store';

@Component({
  standalone: false,
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginButtonComponent {
  @Input() appearance: TuiAppearance | string = 'primary';

  @Input() buttonHierarchy?: 'header' | 'form';

  private readonly headerStore = inject(HeaderStore);

  constructor(
    private readonly modalService: ModalService,
    private readonly gtmService: GoogleTagManagerService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly router: Router
  ) {}

  public showModal(): void {
    if (this.buttonHierarchy) {
      this.gtmService.fireClickOnConnectWalletButtonEvent(this.buttonHierarchy);
    }
    const wallets = this.filterWallets();
    const modalDirection = this.router.url.includes('privacy') ? 'row' : 'column';
    this.modalService
      .openWalletModal(this.injector, { providers: wallets, direction: modalDirection })
      .subscribe();
  }

  private filterWallets(): WALLET_NAME[] {
    const walletsMap = this.headerStore.isMobile
      ? PRIVATE_PROVIDERS_MOBILE_WALLETS_MAP
      : PRIVATE_PROVIDERS_WALLETS_MAP;
    const [_, wallets] =
      Object.entries(walletsMap).find(([provider]) => this.router.url.includes(provider)) || [];

    return wallets || PROVIDERS_LIST.map(provider => provider.value);
  }
}
