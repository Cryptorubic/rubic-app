import { ChangeDetectionStrategy, Component, Injector, Inject } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { SwapTypeService } from '@app/core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@app/features/swaps/features/swap-form/models/swap-provider-type';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenuComponent {
  public isMenuOpened = false;

  public readonly swapType$: Observable<SWAP_PROVIDER_TYPE> = this.swapTypeService.swapMode$;

  public readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly currentUser$ = this.authService.currentUser$;

  private isIframeOpened = false;

  constructor(
    private readonly authService: AuthService,
    private readonly swapTypeService: SwapTypeService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  private toggleLiveChatContainerHeight(action: 'hide' | 'show'): void {
    const livechat = this.document.getElementById('live-chat-iframe') as HTMLIFrameElement;

    if (action === 'hide') {
      this.closeLiveChat(livechat);
    }
    if (action === 'show') {
      this.openLiveChat(livechat);
    }
  }

  public async navigateToSwaps(): Promise<void> {
    await this.swapTypeService.navigateToSwaps();
  }

  public async navigateToLimitOrder(): Promise<void> {
    await this.swapTypeService.navigateToLimitOrder();
  }

  public openNavigationMenu(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openMobileNavigationMenu().subscribe();
  }

  public openRubicMenu(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openRubicMenu().subscribe();
  }

  public openSettings(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openSettings().subscribe();
  }

  public toggleLiveChat(): void {
    const action = this.isIframeOpened ? 'hide' : 'show';
    this.toggleLiveChatContainerHeight(action);
  }

  public openProfile(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openUserProfile(TradesHistory.CROSS_CHAIN).subscribe();
  }

  public openWallet(): void {
    this.toggleLiveChatContainerHeight('hide');
    this.modalService.openWalletModal(this.injector).subscribe();
  }

  private closeLiveChat(liveChat: HTMLIFrameElement): void {
    liveChat.style.opacity = '0';
    this.isIframeOpened = false;
    setTimeout(() => {
      liveChat.contentWindow.postMessage({ type: 'lc_visibility', value: 'minimize' }, '*');
      liveChat.width = '0';
      liveChat.height = '0';
      liveChat.style.top = 'inherit';
    }, 200);
    this.isIframeOpened = false;
  }

  private openLiveChat(liveChat: HTMLIFrameElement): void {
    liveChat.style.opacity = '1';
    const windowHeight = this.document.body.scrollHeight;
    liveChat.height = `${windowHeight - 76}px`;
    liveChat.width = '100%';
    liveChat.style.top = '0';
    liveChat.contentWindow.postMessage({ type: 'lc_visibility', value: 'maximize' }, '*');
    setTimeout(() => {
      liveChat.height = `${windowHeight - 76}px`;
      liveChat.width = '100%';
      liveChat.style.top = '0';
    }, 100);
    this.isIframeOpened = true;
  }
}
