import { ChangeDetectionStrategy, Component, Injector, Inject } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';
import { LiveChatService } from '@core/services/live-chat/live-chat.service';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenuComponent {
  public isMenuOpened = false;

  public readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly currentUser$ = this.authService.currentUser$;

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly liveChatService: LiveChatService
  ) {}

  public async navigateToSwaps(): Promise<void> {
    // await this.swapTypeService.navigateToSwaps();
  }

  public openNavigationMenu(): void {
    this.hideLiveChat();
    this.modalService.openMobileNavigationMenu().subscribe();
  }

  public openRubicMenu(): void {
    this.hideLiveChat();
    this.modalService.openRubicMenu().subscribe();
  }

  public openSettings(): void {
    this.hideLiveChat();
    this.modalService.openSettings(this.injector).subscribe();
  }

  public toggleLiveChat(): void {
    const action = this.liveChatService.isIframeOpened ? 'hide' : 'show';
    this.liveChatService.toggleLiveChatContainerHeight(action);
  }

  public openProfile(): void {
    this.hideLiveChat();
    this.modalService.openUserProfile(TradesHistory.CROSS_CHAIN).subscribe();
  }

  public openWallet(): void {
    this.hideLiveChat();
    this.modalService.openWalletModal(this.injector).subscribe();
  }

  private hideLiveChat(): void {
    this.liveChatService.toggleLiveChatContainerHeight('hide');
  }
}
