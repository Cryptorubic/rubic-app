import { ClaimHistoryItem } from '@app/core/services/backend/loyalty-api/models/claim-history-item';

export interface CollectionCard extends Omit<ClaimHistoryItem, 'claimId'> {
  id: string;
  isDetailsOpened: boolean;
  isEmpty?: boolean;
  isPlaceholder?: boolean;
}
