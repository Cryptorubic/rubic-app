import { ChangeDetectionStrategy, Component, Inject, ViewContainerRef } from '@angular/core';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk/tokens';

@Component({
  selector: 'app-live-chat',
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveChatComponent {
  constructor(
    private readonly viewRef: ViewContainerRef,
    @Inject(TUI_IS_MOBILE) private readonly isMobile: boolean
  ) {}

  public setupIframe(): void {
    const iframe = this.viewRef.element.nativeElement.querySelector(
      'iframe#live-chat-iframe'
    ) as HTMLIFrameElement;
    window.addEventListener(
      'message',
      event => {
        if (!this.isMobile) {
          if (event.data?.type === 'lc_visibility') {
            const value = event.data?.value;

            if (value === 'minimized' || value === 'hidden') {
              iframe.height = '84px';
              iframe.width = '84px';
              iframe.style.opacity = '1';
            }

            if (value === 'maximized') {
              iframe.width = '352px';
              iframe.height = '652px';
              iframe.style.opacity = '1';
            }
          }
        }
      },
      false
    );
  }
}
