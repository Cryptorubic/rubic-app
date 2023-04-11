import { Component, ChangeDetectionStrategy, Inject, Injector } from '@angular/core';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { AuthService } from '@core/services/auth/auth.service';
import { IframeService } from '@core/services/iframe/iframe.service';
import { ModalService } from '@app/core/modals/services/modal.service';

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
    private readonly modalService: ModalService,
    private readonly authService: AuthService,
    private readonly iframeService: IframeService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public onLogin(): void {
    this.modalService.openWalletModal(this.injector).subscribe();
  }
}
