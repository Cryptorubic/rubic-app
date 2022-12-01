import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { AuthService } from '@core/services/auth/auth.service';
import { map } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';

@Component({
  selector: 'app-empty-list',
  templateUrl: './empty-list.component.html',
  styleUrls: ['./empty-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyListComponent {
  public readonly user$ = this.authService.currentUser$;

  public readonly hasSearchQuery$ = this.tokenSelectService.searchQuery$.pipe(
    map(query => Boolean(query.length))
  );

  public readonly listType$ = this.tokenSelectService.listType$;

  constructor(
    private readonly tokenSelectService: TokensSelectorService,
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService
  ) {}

  public switchToDefaultList(): void {
    this.tokenSelectService.switchListType();
  }

  public openAuthModal(): void {
    this.walletsModalService.open$();
  }
}
