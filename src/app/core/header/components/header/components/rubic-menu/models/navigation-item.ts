import { Router } from '@angular/router';
import { LiveChatService } from '@app/core/services/live-chat/live-chat.service';

export type NavigationItem = {
  translateKey: string;
  imagePath?: string;
  target?: '_self' | '_blank';
  active?: boolean;
  type: 'internal' | 'external';
  getLink: () => string;
};

export interface SectionItemServices {
  liveChatService: LiveChatService;
  router: Router;
}

export interface SectionItem {
  onClick?: (services: SectionItemServices) => void;
  children: NavigationItem[];
}
