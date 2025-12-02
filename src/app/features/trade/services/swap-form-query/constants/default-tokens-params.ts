import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

export const defaultFormParameters = {
  swap: {
    fromChain: BLOCKCHAIN_NAME.SOLANA,
    toChain: BLOCKCHAIN_NAME.ETHEREUM,
    from: {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BNB',
      [BLOCKCHAIN_NAME.POLYGON]: 'MATIC',
      [BLOCKCHAIN_NAME.HARMONY]: 'ONE',
      [BLOCKCHAIN_NAME.AVALANCHE]: 'AVAX',
      [BLOCKCHAIN_NAME.MOONRIVER]: 'MOVR',
      [BLOCKCHAIN_NAME.ARBITRUM]: 'AETH',
      [BLOCKCHAIN_NAME.AURORA]: 'aETH',
      [BLOCKCHAIN_NAME.TELOS]: 'TLOS'
    },
    to: {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'RBC',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BRBC'
    },
    amount: '1'
  }
};

export type DefaultParametersFrom = keyof typeof defaultFormParameters.swap.from;
export type DefaultParametersTo = keyof typeof defaultFormParameters.swap.to;
