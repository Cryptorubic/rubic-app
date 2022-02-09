import { StakePeriod } from '../models/stake-period.enum';

export const POOL_TOKENS_RATE = {
  [StakePeriod.SHORT]: 1,
  [StakePeriod.AVERAGE]: 0.85,
  [StakePeriod.LONG]: 0.7
};
