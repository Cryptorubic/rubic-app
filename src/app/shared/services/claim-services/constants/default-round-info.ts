import { DefaultRoundInfo } from '@app/shared/models/content/claim/claim-round';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

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
