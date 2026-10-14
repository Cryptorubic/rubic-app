import { CollectionCard } from '../models/collection-card';
import { RewardCard } from '../models/reward-card';

export const PLACEHOLDER_REWARD_CARD: RewardCard = {
  id: 'placeholder',
  title: '',
  subTitle: '',
  description: '',
  imageUrl: 'assets/images/rewards/more-rewards-on-the-way.svg',
  isActive: false,
  variants: [],
  redeemDescription: '',
  redeemNote: '',
  deliveryType: 'delivered_value',
  selectedVariantId: null,
  isDetailsOpened: false,
  isPlaceholder: true
};

export const PLACEHOLDER_COLLECTION_CARD: CollectionCard = {
  id: 'placeholder',
  subscriptionId: '',
  variantId: '',
  variantTitle: '',
  title: '',
  subTitle: '',
  description: '',
  imageUrl: null,
  status: 'awaiting_input',
  pointsSpent: 0,
  deliveryType: 'user_input',
  createdAt: '',
  isDetailsOpened: false,
  isPlaceholder: true
};
