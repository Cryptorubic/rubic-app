import { CollectionCard } from '../models/collection-card';

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
