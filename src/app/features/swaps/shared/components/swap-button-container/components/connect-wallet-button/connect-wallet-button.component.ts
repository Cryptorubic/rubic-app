import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { IframeService } from '@core/services/iframe/iframe.service';

@Component({
  selector: 'app-connect-wallet-button',
  templateUrl: './connect-wallet-button.component.html',
  styleUrls: ['./connect-wallet-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectWalletButtonComponent {
  public readonly idPrefix = this.swapButtonContainerService.idPrefix;

  public readonly isIframe = this.iframeService.isIframe;

  public readonly user$ = this.authService.currentUser$;

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly walletsModalService: WalletsModalService,
    private readonly authService: AuthService,
    private readonly iframeService: IframeService
  ) {}

  public onLogin(): void {
    this.walletsModalService.open().subscribe();
  }
}
