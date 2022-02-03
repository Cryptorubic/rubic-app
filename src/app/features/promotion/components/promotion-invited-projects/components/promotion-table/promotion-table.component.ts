import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { TokensService } from '@core/services/tokens/tokens.service';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';

@Component({
  selector: 'app-promotion-table',
  templateUrl: './promotion-table.component.html',
  styleUrls: ['./promotion-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionTableComponent {
  @Input() tableData: PromotionTableData = [];

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public readonly columns = [
    'projectUrl',
    'invitationDate',
    'tradingVolume',
    'received',
    'receivedTokens'
  ];

  private currentPageIndex = 0;

  private pageSize = 10;

  get pageTableData(): PromotionTableData {
    if (!this.tableData) {
      return [];
    }

    const fromIndex = this.currentPageIndex * this.pageSize;
    const toIndex = Math.min((this.currentPageIndex + 1) * this.pageSize, this.tableData.length);

    return this.tableData.slice(fromIndex, toIndex);
  }

  constructor(private readonly tokensService: TokensService) {}

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }

  public onPageChange(pageIndex: number): void {
    this.currentPageIndex = pageIndex;
  }

  public onSizeChange(size: number): void {
    this.pageSize = size;
  }
}
