import { Component } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { AuthService } from '@app/core/services/auth/auth.service';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';

@Component({
  selector: 'app-rubic-menu-toggler',
  templateUrl: './rubic-menu-toggler.component.html',
  styleUrls: ['./rubic-menu-toggler.component.scss']
})
export class RubicMenuTogglerComponent {
  public readonly isMobile = this.headerStore.isMobile;

  public isOpened = false;

  public readonly currentUser$ = this.authService.currentUser$;

  public readonly unreadTrades$ = this.recentTradesStoreService.unreadTrades$;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService,
    private readonly recentTradesStoreService: RecentTradesStoreService
  ) {}

  public closeMenu(): void {
    this.isOpened = false;
  }
}
