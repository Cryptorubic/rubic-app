import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LiveChatService } from '@core/services/live-chat/live-chat.service';

@Component({
  selector: 'app-banner',
  templateUrl: './app-banner.component.html',
  styleUrls: ['./app-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {
  @Input() href: string;

  constructor(private readonly liveChatService: LiveChatService) {}

  public toggleLiveChat(): void {
    this.liveChatService.toggleLiveChatContainerHeight('show', true);
  }
}
