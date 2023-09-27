import BigNumber from 'bignumber.js';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';

interface IDefaultRoundInfo {
  isAlreadyClaimed: boolean;
  isParticipantOfCurrentRound: boolean;
  claimAmount: BigNumber;
  claimData: ClaimTokensData;
}

export const DefaultRoundInfo: IDefaultRoundInfo = {
  isAlreadyClaimed: true,
  isParticipantOfCurrentRound: false,
  claimAmount: new BigNumber(0),
  claimData: {
    contractAddress: '',
    node: null,
    proof: []
  }
};
