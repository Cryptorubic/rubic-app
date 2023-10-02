import BigNumber from 'bignumber.js';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

interface IDefaultRoundInfo {
  isAlreadyClaimed: boolean;
  isParticipantOfCurrentRound: boolean;
  claimAmount: BigNumber;
  claimData: ClaimTokensData;
  network: BlockchainName;
}

export const DefaultRoundInfo: IDefaultRoundInfo = {
  isAlreadyClaimed: true,
  isParticipantOfCurrentRound: false,
  claimAmount: new BigNumber(0),
  claimData: {
    contractAddress: '',
    node: null,
    proof: []
  },
  network: BLOCKCHAIN_NAME.ARBITRUM
};
