import { RewardCard } from '../models/reward-card';

export const EMPTY_CARD: Omit<RewardCard, 'id'> = {
  title: '',
  subTitle: '',
  description: '',
  imageUrl: '',
  price: 0,
  isActive: false,
  canClaim: null,
  isDetailsOpened: false,
  isEmpty: true
};
