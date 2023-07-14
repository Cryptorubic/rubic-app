import { Inject, Injectable } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk/tokens';

@Injectable({ providedIn: 'root' })
export class LiveChatService {
  private _isIframeOpened = false;

  public get isIframeOpened(): boolean {
    return this._isIframeOpened;
  }

  constructor(
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Inject(TUI_IS_MOBILE) private readonly isMobile: boolean
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

  public toggleLiveChatContainerHeight(action: 'hide' | 'show'): void {
    const livechat = this.window.document.getElementById('live-chat-iframe') as HTMLIFrameElement;

    if (action === 'hide') {
      this.closeLiveChat(livechat);
    }
    if (action === 'show') {
      this.openLiveChat(livechat);
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

  private openLiveChat(liveChat: HTMLIFrameElement): void {
    liveChat.style.opacity = '1';
    const windowHeight = this.window.document.body.scrollHeight;
    liveChat.height = `${windowHeight - 76}px`;
    liveChat.width = '100%';
    liveChat.style.top = '0';
    liveChat.contentWindow.postMessage({ type: 'lc_visibility', value: 'maximize' }, '*');
    setTimeout(() => {
      liveChat.height = `${windowHeight - 76}px`;
      liveChat.width = '100%';
      liveChat.style.top = '0';
    }, 100);
    this._isIframeOpened = true;
  }
}
