import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { TokensService } from '@core/services/tokens/tokens.service';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { PromotionTableColumn } from '@features/promotion/models/table-column.type';
import { SortParameter } from '@features/promotion/models/sort-parameter.interface';
import { promotionTableColumns } from '@features/promotion/constants/PROMOTION_TABLE_COLUMNS';
import { promotionTableTranslations } from '@features/promotion/constants/PROMOTION_TABLE_TRANSLATIONS';

/**
 * Dump component. Table which contains info about projects invited by promoter.
 */
@Component({
  selector: 'app-promotion-table',
  templateUrl: './promotion-table.component.html',
  styleUrls: ['./promotion-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionTableComponent {
  /**
   * Data to show in the accordions.
   */
  @Input() tableData: PromotionTableData = [];

  /**
   * Sort parameter to show in the table head.
   */
  @Input() sortParameter: SortParameter | null = null;

  /**
   * Emits when user changes sort parameter or sort direction.
   */
  @Output() sortParameterChange = new EventEmitter<PromotionTableColumn>();

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public readonly columns = promotionTableColumns;

  public readonly translations = promotionTableTranslations;

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

  public onSortClick(column: PromotionTableColumn): void {
    this.sortParameterChange.emit(column);
  }
}
