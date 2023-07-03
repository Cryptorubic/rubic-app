import { ChangeDetectionStrategy, Component, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-live-chat',
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveChatComponent {
  constructor(private readonly viewRef: ViewContainerRef) {}

  public setupIframe(): void {
    const iframe = this.viewRef.element.nativeElement.querySelector(
      'iframe#live-chat-iframe'
    ) as HTMLIFrameElement;
    window.addEventListener(
      'message',
      event => {
        if (event.data?.type === 'lc_visibility') {
          const value = event.data?.value;

          if (value === 'minimized' || value === 'hidden') {
            iframe.height = '84px';
            iframe.width = '84px';
          }

          if (value === 'maximized') {
            iframe.width = '352px';
            iframe.height = '652px';
          }
        }
      },
      false
    );
  }
}
