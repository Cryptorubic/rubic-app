import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { TokensListType } from '@features/trade/components/assets-selector/models/tokens-list-type';

@Component({
  selector: 'app-empty-list',
  templateUrl: './empty-list.component.html',
  styleUrls: ['./empty-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyListComponent {
  @Input({ required: true }) hasQuery: boolean;

  @Input({ required: true }) tokensType: TokensListType;

  public readonly user$ = this.authService.currentUser$;

  // public get hasSearchQuery$(): Observable<boolean> {
  //   return this.assetsSelectorFacade
  //     .getAssetsService(this.type)
  //     .assetsQuery$.pipe(map(query => Boolean(query.length)));
  // }

  public readonly listType$ = this.tokensListTypeService.listType$;

  constructor(
    private readonly tokensListTypeService: TokensListTypeService,
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
