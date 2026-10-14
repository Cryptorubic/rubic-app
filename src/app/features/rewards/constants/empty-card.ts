import { CollectionCard } from '../models/collection-card';
import { RewardCard } from '../models/reward-card';

export const EMPTY_REWARD_CARD: Omit<RewardCard, 'id'> = {
  title: '',
  subTitle: '',
  description: '',
  imageUrl: '',
  isActive: false,
  variants: [],
  selectedVariantId: null,
  isDetailsOpened: false,
  isEmpty: true
};

export const EMPTY_COLLECTION_CARD: Omit<CollectionCard, 'id'> = {
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
  isEmpty: true
};
