import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SwapButtonContainerService } from '@features/swap-button-container/services/swap-button-container.service';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { IframeService } from '@core/services/iframe/iframe.service';

@Component({
  selector: 'app-connect-wallet-button',
  templateUrl: './connect-wallet-button.component.html',
  styleUrls: ['./connect-wallet-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectWalletButtonComponent {
  public tokensFilled$ = this.swapFormService.inputValueChanges.pipe(
    startWith(this.swapFormService.inputValue),
    map(form => Boolean(form.fromToken && form.toToken))
  );

  public readonly isIframe = this.iframeService.isIframe;

  public readonly user$ = this.authService.getCurrentUser();

  public get idPrefix(): string {
    return this.swapButtonContainerService.idPrefix;
  }

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapFormService: SwapFormService,
    private readonly walletsModalService: WalletsModalService,
    private readonly authService: AuthService,
    private readonly iframeService: IframeService
  ) {}

  public onLogin(): void {
    this.walletsModalService.open().subscribe();
  }
}
