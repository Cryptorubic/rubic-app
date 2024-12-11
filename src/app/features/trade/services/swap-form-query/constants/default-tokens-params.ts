import { BLOCKCHAIN_NAME } from 'rubic-sdk';

export const defaultFormParameters = {
  swap: {
    fromChain: BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET,
    toChain: BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET,
    from: {
      [BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET]: 'ETH',
      [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: 'ETH'
    },
    to: {},
    amount: '1'
  }
};

export type DefaultParametersFrom = keyof typeof defaultFormParameters.swap.from;
export type DefaultParametersTo = keyof typeof defaultFormParameters.swap.to;
