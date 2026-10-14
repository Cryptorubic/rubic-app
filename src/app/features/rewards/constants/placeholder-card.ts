import { RewardCard } from '../models/reward-card';

export const PLACEHOLDER_CARD: RewardCard = {
  id: 'placeholder',
  title: '',
  subTitle: '',
  description: '',
  imageUrl: 'assets/images/rewards/more-rewards-on-the-way.svg',
  isActive: false,
  variants: [],
  selectedVariantId: null,
  isDetailsOpened: false,
  isPlaceholder: true
};
