import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { TokensService } from '@core/services/tokens/tokens.service';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { SortParameter } from '@features/promotion/models/sort-parameter.interface';
import { PromotionTableColumn } from '@features/promotion/models/table-column.type';
import { promotionTableTranslations } from '@features/promotion/constants/PROMOTION_TABLE_TRANSLATIONS';
import { promotionTableColumns } from '@features/promotion/constants/PROMOTION_TABLE_COLUMNS';

/**
 * Dump component. Accordions which contains info about projects invited by promoter.
 */
@Component({
  selector: 'app-promotion-accordion',
  templateUrl: './promotion-accordion.component.html',
  styleUrls: ['./promotion-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionAccordionComponent {
  /**
   * Data to show in the accordions.
   */
  @Input() tableData: PromotionTableData = [];

  /**
   * Sort parameter to show above accordions.
   */
  @Input() sortParameter: SortParameter | null = null;

  /**
   * Emits when user changes sort parameter or sort direction.
   */
  @Output() sortParameterChange = new EventEmitter<PromotionTableColumn>();

  public currentPageIndex = 0;

  public isDropdownOpened = false;

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  private readonly PAGE_LENGTH = 5;

  public readonly columns = promotionTableColumns;

  public readonly translations = promotionTableTranslations;

  get pagesNumber(): number {
    if (!this.tableData) {
      return 0;
    }

    return Math.ceil(this.tableData.length / this.PAGE_LENGTH);
  }

  get pageTableData(): PromotionTableData {
    if (!this.tableData) {
      return [];
    }

    const fromIndex = this.currentPageIndex * this.PAGE_LENGTH;
    const toIndex = Math.min((this.currentPageIndex + 1) * this.PAGE_LENGTH, this.tableData.length);

    return this.tableData.slice(fromIndex, toIndex);
  }

  constructor(private readonly tokensService: TokensService) {}

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }

  public goToPage(index: number): void {
    this.currentPageIndex = index;
  }

  public onSortColumnSelect(column: PromotionTableColumn): void {
    this.isDropdownOpened = false;

    if (column !== this.sortParameter.sortColumn) {
      this.sortParameterChange.emit(column);
    }
  }

  public onDescendingChange(): void {
    this.sortParameterChange.emit(this.sortParameter.sortColumn);
  }
}
