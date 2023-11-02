import BigNumber from 'bignumber.js';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { ClaimName } from '@shared/services/claim-services/models/claim-name';
import { BlockchainName } from 'rubic-sdk';

export type ClaimStatus = 'closed' | 'soon' | 'active';

export interface ClaimRound {
  roundNumber: number;
  claimDate: string;
  claimData: ClaimTokensData;
  claimAmount: BigNumber;
  status: ClaimStatus;
  claimName: ClaimName;
  network: BlockchainName;
  isAlreadyClaimed?: boolean;
  participantOfPrevRounds?: 'not participant' | 'participant';
  isParticipantOfCurrentRound?: boolean;
}
