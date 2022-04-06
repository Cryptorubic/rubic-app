import { TokenLp } from './token-lp.interface';

export interface DepositsResponse {
  collectedRewards: Array<string>;
  parsedArrayOfTokens: Array<TokenLp>;
  rewardsToCollect: Array<string>;
  isWithdrawable: Array<boolean>;
}
