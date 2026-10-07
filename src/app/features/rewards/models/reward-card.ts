import { SubscriptionItem } from '@app/core/services/backend/loyalty-api/models/subscription-item';

export interface RewardCard extends SubscriptionItem {
  isDetailsOpened: boolean;
  isEmpty?: boolean;
  isPlaceholder?: boolean;
}
