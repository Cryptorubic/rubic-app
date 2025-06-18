import { Inject, Injectable } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { ModalService } from '@app/core/modals/services/modal.service';

@Injectable({ providedIn: 'root' })
export class LiveChatService {
  private _isIframeOpened = false;

  public get isIframeOpened(): boolean {
    return this._isIframeOpened;
  }

  private get isMobile(): boolean {
    return this.windowWidth.windowSize <= WindowSize.MOBILE_MD;
  }

  constructor(
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly windowWidth: WindowWidthService,
    private readonly modalService: ModalService
  ) {}

  public initMessageListener(): void {
    const liveChat = this.window.document.querySelector(
      'iframe#live-chat-iframe'
    ) as HTMLIFrameElement;

    this.window.addEventListener(
      'message',
      event => {
        if (event.data?.type === 'lc_visibility') {
          const value = event.data?.value;

          if (!this.isMobile) {
            if (value === 'minimized' || value === 'hidden') {
              liveChat.height = '84px';
              liveChat.width = '84px';
              liveChat.style.opacity = '1';
              this._isIframeOpened = false;
            }

            if (value === 'maximized') {
              liveChat.width = '352px';
              liveChat.height = '652px';
              liveChat.style.opacity = '1';
              this._isIframeOpened = true;
            }
          } else {
            if (value === 'minimized' || value === 'hidden') {
              liveChat.height = '0';
              liveChat.width = '0';
              liveChat.style.opacity = '0';
              this._isIframeOpened = false;
            }

            if (value === 'maximized') {
              const windowHeight = this.window.document.body.scrollHeight;
              liveChat.height = `${windowHeight - 76}px`;
              liveChat.width = '100%';
              liveChat.style.opacity = '1';
              liveChat.style.top = '0';
              liveChat.style.bottom = 'inherit';
              this._isIframeOpened = true;
            }
          }
        }
      },
      false
    );
  }

  public toggleLiveChatContainerHeight(action: 'hide' | 'show', customPosition?: boolean): void {
    const livechat = this.window.document.getElementById('live-chat-iframe') as HTMLIFrameElement;

    if (action === 'hide') {
      this.closeLiveChat(livechat);
    }
    if (action === 'show') {
      this.modalService.closeModal();
      this.openLiveChat(livechat, customPosition);
    }
  }

  private closeLiveChat(liveChat: HTMLIFrameElement): void {
    liveChat.style.opacity = '0';
    this._isIframeOpened = false;
    setTimeout(() => {
      liveChat.contentWindow.postMessage({ type: 'lc_visibility', value: 'minimize' }, '*');
      liveChat.width = '0';
      liveChat.height = '0';
      liveChat.style.top = 'inherit';
    }, 200);
    this._isIframeOpened = false;
  }

  private openLiveChat(liveChat: HTMLIFrameElement, customPosition?: boolean): void {
    const windowHeight = this.window.document.body.scrollHeight;
    let bottom = 'auto';
    let top = '0';
    let height = `${windowHeight - 76}px`;

    if (customPosition) {
      bottom = '0';
      top = 'auto';
      height = '100%';
    }
    liveChat.style.opacity = '1';
    liveChat.height = height;
    liveChat.width = '100%';
    liveChat.style.top = top;
    liveChat.style.bottom = bottom;
    liveChat.contentWindow.postMessage({ type: 'lc_visibility', value: 'maximize' }, '*');
    this._isIframeOpened = true;
  }
}
