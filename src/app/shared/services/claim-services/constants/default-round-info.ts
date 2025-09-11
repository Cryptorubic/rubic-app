import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@cryptorubic/sdk';
import { DefaultRoundInfo } from '@shared/models/claim/claim-round';

export const defaultRoundInfo: DefaultRoundInfo = {
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
