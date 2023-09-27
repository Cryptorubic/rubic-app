import BigNumber from 'bignumber.js';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';

export interface ClaimRound {
  roundNumber: number;
  claimDate: string;
  claimData: ClaimTokensData;
  claimAmount: BigNumber;
  isClosed: boolean;
  isAlreadyClaimed?: boolean;
  isParticipantOfPrevRounds?: boolean;
  isParticipantOfCurrentRound?: boolean;
}
