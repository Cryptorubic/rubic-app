import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import BigNumber from 'bignumber.js';

export const bannerTokens = {
  from: {
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: 'ETH',
    amount: new BigNumber(1)
  },
  to: {
    blockchain: BLOCKCHAIN_NAME.MOONRIVER,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: 'MOVR'
  }
};
