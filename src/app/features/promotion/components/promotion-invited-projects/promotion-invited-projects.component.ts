import { Component, ChangeDetectionStrategy, HostListener, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { PromotionService } from '@features/promotion/services/promotion.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { map } from 'rxjs/operators';
import { WINDOW } from '@ng-web-apis/common';

const DESKTOP_WIDTH_BREAKPOINT = 1000;

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

  public readonly isWalletConnected$: Observable<boolean>;

  constructor(
    @Inject(WINDOW) private readonly window: Window,
    private readonly promotionService: PromotionService,
    private readonly tokensService: TokensService,
    private readonly walletsModalService: WalletsModalService,
    authService: AuthService
  ) {
    this.isDesktop = this.window.innerWidth >= DESKTOP_WIDTH_BREAKPOINT;
    this.isLoading$ = promotionService.isTableDataLoading$;
    this.tableData$ = promotionService.tableData$;
    this.isWalletConnected$ = authService.getCurrentUser().pipe(map(user => !!user?.address));
  }

  public onRefresh(): void {
    this.promotionService.updatePromotionData();
  }

  public openWalletsModal(): void {
    this.walletsModalService.open$();
  }

  @HostListener('window:resize')
  private onResize(): void {
    this.isDesktop = this.window.innerWidth >= DESKTOP_WIDTH_BREAKPOINT;
  }
}
