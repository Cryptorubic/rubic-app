import BigNumber from 'bignumber.js';
import { ClaimName } from '@shared/services/claim-services/models/claim-name';
import { BlockchainName } from 'rubic-sdk';
import { ClaimTokensData } from './claim-tokens-data';

export type ClaimStatus = 'closed' | 'soon' | 'active' | 'expired';

export interface DefaultRoundInfo {
  isAlreadyClaimed?: boolean;
  isParticipantOfCurrentRound?: boolean;
  claimAmount: BigNumber;
  claimData: ClaimTokensData;
  network: BlockchainName;
}

export interface ClaimRound extends DefaultRoundInfo {
  roundNumber: number;
  claimDate: string;
  status: ClaimStatus;
  claimName: ClaimName;
  isParticipantOfPrevRounds?: boolean;
}
