import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { AuthService } from '@app/core/services/auth/auth.service';
import { UnreadTradesService } from '@app/core/services/unread-trades-service/unread-trades.service';

@Component({
  selector: 'app-rubic-menu-toggler-mobile',
  standalone: false,
  templateUrl: './rubic-menu-toggler-mobile.component.html',
  styleUrl: './rubic-menu-toggler-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicMenuTogglerMobileComponent {
  public readonly isMobile = this.headerStore.isMobile;

  public readonly currentUser$ = this.authService.currentUser$;

  public readonly unreadTrades$ = this.recentTradesStoreService.unreadTrades$;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService,
    private readonly recentTradesStoreService: UnreadTradesService
  ) {}
}
