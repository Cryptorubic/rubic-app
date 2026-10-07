import { RewardCard } from '../models/reward-card';

export const PLACEHOLDER_CARD: RewardCard = {
  id: 'placeholder',
  title: '',
  subTitle: '',
  description: '',
  imageUrl: 'assets/images/rewards/more-rewards-on-the-way.svg',
  price: 0,
  isActive: false,
  canClaim: null,
  isDetailsOpened: false,
  isPlaceholder: true
};
