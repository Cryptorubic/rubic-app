import { PromotionTableColumn } from '@features/promotion/models/table-column.type';

export interface SortParameter {
  sortColumn: PromotionTableColumn;
  descending: boolean;
}
