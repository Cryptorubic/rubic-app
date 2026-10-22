export type SubscriptionType =
  'CLAUDE' | 'TRADINGVIEW' | 'IVPN' | 'NOTESNOOK' | 'TELEGRAM' | 'COOKIE';

export interface SubscriptionVariant {
  id: string;
  title: string;
  price: number;
  isActive: boolean;
  canClaim?: boolean | null;
}

export interface SubscriptionItem {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  variants: SubscriptionVariant[];
  redeemDescription: string;
  redeemInputPlaceholder: string;
  redeemNote: string;
  deliveryType: 'user_input' | 'delivered_value' | 'payout';
  subscriptionType: SubscriptionType;
}
