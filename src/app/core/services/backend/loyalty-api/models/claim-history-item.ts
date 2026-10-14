export type ClaimStatus =
  'awaiting_input' | 'requested' | 'ready' | 'received' | 'rejected' | 'under_review' | 'denied';

export type ClaimDeliveryType = 'user_input' | 'delivered_value' | 'payout';

export type ClaimRequiredInput = 'tradingview_username' | 'telegram_handle';

export interface ClaimHistoryItem {
  claimId: string;
  subscriptionId: string;
  variantId: string;
  variantTitle: string;
  title: string;
  subTitle: string;
  description: string;
  imageUrl: string | null;
  status: ClaimStatus;
  pointsSpent: number;
  deliveryType: ClaimDeliveryType;
  requiredInput?: ClaimRequiredInput | null;
  userInput?: string | null;
  activationTitle?: string | null;
  activationDescription?: string | null;
  activationCode?: string | null;
  activationLink?: string | null;
  activationNote?: string | null;
  activatedAt?: string | null;
  createdAt: string;
}
