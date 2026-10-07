export interface SubscriptionItem {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  imageUrl: string;
  price: number;
  isActive: boolean;
  canClaim: boolean | null;
}
