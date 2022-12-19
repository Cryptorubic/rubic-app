import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { map } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { SearchQueryService } from '@features/swaps/shared/components/assets-selector/services/search-query-service/search-query.service';
import { TokensListTypeService } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/tokens-list-type.service';

@Component({
  selector: 'app-empty-list',
  templateUrl: './empty-list.component.html',
  styleUrls: ['./empty-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyListComponent {
  public readonly user$ = this.authService.currentUser$;

  public readonly hasSearchQuery$ = this.searchQueryService.query$.pipe(
    map(query => Boolean(query.length))
  );

  public readonly listType$ = this.tokensListTypeService.listType$;

  constructor(
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly searchQueryService: SearchQueryService,
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService
  ) {}

  public switchToDefaultList(): void {
    this.tokensListTypeService.switchListType();
  }

  public openAuthModal(): void {
    this.walletsModalService.open$();
  }
}
