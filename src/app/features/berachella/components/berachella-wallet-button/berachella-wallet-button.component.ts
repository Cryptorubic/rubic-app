import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { combineLatestWith, map, startWith } from 'rxjs/operators';
import { basePath, blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ModalService } from '@core/modals/services/modal.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-berachella-wallet-button',
  templateUrl: './berachella-wallet-button.component.html',
  styleUrls: ['./berachella-wallet-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BerachellaWalletButtonComponent {
  public readonly currentUser$ = this.authService.currentUser$;

  public readonly profileText$: Observable<string> = this.currentUser$.pipe(
    map(user => (user?.name ? user.name : user?.address)),
    startWith(this.authService.userAddress)
  );

  public readonly avatar$ = this.currentUser$.pipe(
    combineLatestWith(this.walletConnectorService.networkChange$),
    map(([user, blockchainName]) => {
      const currentBlockchainIcon = blockchainName
        ? blockchainIcon[blockchainName]
        : `${basePath}default-chain.svg`;

      return user?.avatar ? user.avatar : currentBlockchainIcon;
    })
  );

  constructor(
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService,
    private readonly gtmService: GoogleTagManagerService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public showModal(): void {
    this.modalService.openWalletModal(this.injector).subscribe();
    this.gtmService.fireBerachaellaEvent('connect_wallet');
  }

  public logout(): void {
    this.authService.disconnectWallet();
  }
}
