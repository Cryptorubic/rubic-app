import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LiveChatService } from '@core/services/live-chat/live-chat.service';

@Component({
  selector: 'app-live-chat',
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveChatComponent {
  constructor(private readonly liveChatService: LiveChatService) {}

  public setupIframe(): void {
    this.liveChatService.initMessageListener();
  }
}
