import { BLOCKCHAIN_NAME } from 'rubic-sdk';

export const defaultFormParameters = {
  swap: {
    fromChain: BLOCKCHAIN_NAME.GOERLI,
    toChain: BLOCKCHAIN_NAME.GOERLI,
    from: {
      [BLOCKCHAIN_NAME.GOERLI]: 'ETH',
      [BLOCKCHAIN_NAME.SCROLL_TESTNET]: 'ETH'
    },
    to: {},
    amount: '1'
  }
};

export type DefaultParametersFrom = keyof typeof defaultFormParameters.swap.from;
export type DefaultParametersTo = keyof typeof defaultFormParameters.swap.to;
