import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { PromotionService } from '@features/promotion/services/promotion.service';
import { Observable } from 'rxjs';
import { TokensService } from '@core/services/tokens/tokens.service';

@Component({
  selector: 'app-promotion-table',
  templateUrl: './promotion-table.component.html',
  styleUrls: ['./promotion-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionTableComponent {
  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public readonly columns = [
    'projectUrl',
    'invitationDate',
    'tradingVolume',
    'received',
    'receivedTokens'
  ];

  public readonly isLoading$: Observable<boolean>;

  public readonly tableData$: Observable<PromotionTableData>;

  constructor(
    private readonly promotionService: PromotionService,
    private readonly tokensService: TokensService
  ) {
    this.isLoading$ = promotionService.isLoading$;
    this.tableData$ = promotionService.tableData$;
  }

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }

  public onRefresh(): void {
    this.promotionService.updatePromotionData();
  }
}
