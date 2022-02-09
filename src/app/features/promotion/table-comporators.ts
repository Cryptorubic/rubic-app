import { PromotionTableDataItem } from '@features/promotion/models/promotion-table-data-item.interface';
import { PromotionTableColumn } from '@features/promotion/models/table-column.type';
import { Comparator } from '@shared/models/utils/comparator';

type Multiplier = 1 | -1;

function buildSimpleComparator(
  fieldName: keyof PromotionTableDataItem,
  reverse = false
): (descending: boolean) => Comparator<PromotionTableDataItem> {
  return (descending: boolean) => {
    let multiplier: Multiplier = descending ? 1 : -1;
    if (reverse) {
      multiplier = -multiplier as Multiplier;
    }

    return (a, b) => {
      if (a[fieldName] < b[fieldName]) {
        return multiplier;
      }
      if (a[fieldName] > b[fieldName]) {
        return -multiplier as Multiplier;
      }
      return 0;
    };
  };
}

const receivedComparator = buildSimpleComparator('received');
const receivedTokensComparator = buildSimpleComparator('receivedTokens');
const tradingVolumeComparator = buildSimpleComparator('tradingVolume');
const dateComparator = buildSimpleComparator('invitationDate');
const nameComparator = buildSimpleComparator('projectName', true);

export const comparators: Record<
  PromotionTableColumn,
  (descending: boolean) => Comparator<PromotionTableDataItem>
> = {
  projectName: nameComparator,
  invitationDate: dateComparator,
  received: receivedComparator,
  receivedTokens: receivedTokensComparator,
  tradingVolume: tradingVolumeComparator
};
