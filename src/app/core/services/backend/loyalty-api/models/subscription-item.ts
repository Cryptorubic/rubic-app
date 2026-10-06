export interface SubscriptionItem {
  id: number;
  title: string;
  description: string;
  price: number;
  isActive: boolean;
  canClaim?: boolean | null;
}
