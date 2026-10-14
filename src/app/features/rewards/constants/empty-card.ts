import { RewardCard } from '../models/reward-card';

export const EMPTY_CARD: Omit<RewardCard, 'id'> = {
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
