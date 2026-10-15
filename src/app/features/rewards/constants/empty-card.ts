import { CollectionCard } from '../models/collection-card';

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
