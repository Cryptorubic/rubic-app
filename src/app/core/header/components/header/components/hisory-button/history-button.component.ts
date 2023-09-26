import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecentTradesStoreService } from '@core/services/recent-trades/recent-trades-store.service';
import { ModalService } from '@core/modals/services/modal.service';
import { HeaderStore } from '@core/header/services/header.store';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-history-button',
  templateUrl: './history-button.component.html',
  styleUrls: ['./history-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryButtonComponent {
  public readonly unreadTrades$ = this.recentTradesStoreService.unreadTrades$;

  public readonly currentUser$ = this.authService.currentUser$;

  constructor(
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService
  ) {}

  public openRecentTradesModal(): void {
    this.modalService
      .openRecentTradesModal({
        size: this.headerStore.isMobile ? 'page' : ('xl' as 'l') // hack for custom modal size
      })
      .subscribe();
  }
}
