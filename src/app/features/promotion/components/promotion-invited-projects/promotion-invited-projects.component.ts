import { Component, ChangeDetectionStrategy, HostListener, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { PromotionService } from '@features/promotion/services/promotion.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { map } from 'rxjs/operators';
import { WINDOW } from '@ng-web-apis/common';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SortParameter } from '@features/promotion/models/sort-parameter.interface';
import { PromotionTableColumn } from '@features/promotion/models/table-column.type';

const DESKTOP_WIDTH_BREAKPOINT = 1000;

/**
 * Table or mobile accordions which contains info about projects invited by promoter.
 */
@Component({
  selector: 'app-promotion-invited-projects',
  templateUrl: './promotion-invited-projects.component.html',
  styleUrls: ['./promotion-invited-projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionInvitedProjectsComponent {
  public isDesktop: boolean;

  public readonly isLoading$: Observable<boolean>;

  public readonly tableData$: Observable<PromotionTableData>;

  public readonly sortParameter$: Observable<SortParameter>;

  public readonly isWalletConnected$: Observable<boolean>;

  public readonly isEthLikeWalletConnected$: Observable<boolean>;

  constructor(
    @Inject(WINDOW) private readonly window: Window,
    private readonly promotionService: PromotionService,
    private readonly tokensService: TokensService,
    private readonly walletsModalService: WalletsModalService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService
  ) {
    this.isDesktop = this.window.innerWidth >= DESKTOP_WIDTH_BREAKPOINT;
    this.isLoading$ = promotionService.isTableDataLoading$;
    this.tableData$ = promotionService.tableData$;
    this.sortParameter$ = promotionService.sortParameter$;

    this.isWalletConnected$ = authService.getCurrentUser().pipe(map(user => !!user?.address));
    this.isEthLikeWalletConnected$ = authService
      .getCurrentUser()
      .pipe(
        map(
          user => !!user?.address && this.walletConnectorService.provider.walletType === 'ethLike'
        )
      );
  }

  public onRefresh(): void {
    this.promotionService.updatePromotionData();
  }

  public openWalletsModal(): void {
    this.walletsModalService.open$();
  }

  public reconnectWallet(): void {
    this.authService.signOut().subscribe(() => this.openWalletsModal());
  }

  public changeSortParameter(sortColumn: PromotionTableColumn): void {
    this.promotionService.updateSortParameter(sortColumn);
  }

  @HostListener('window:resize')
  private onResize(): void {
    this.isDesktop = this.window.innerWidth >= DESKTOP_WIDTH_BREAKPOINT;
  }
}
