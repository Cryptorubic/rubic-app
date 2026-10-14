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
  redeemNote: string;
  deliveryType: 'user_input' | 'delivered_value' | 'payout';
}
