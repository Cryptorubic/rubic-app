import BigNumber from 'bignumber.js';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { ClaimName } from '@shared/services/claim-services/models/claim-name';
import { BlockchainName } from '@cryptorubic/sdk';

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
