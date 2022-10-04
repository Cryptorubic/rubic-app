import { CHAIN_TYPE } from 'rubic-sdk';

export const toBackendWallet: Partial<Record<CHAIN_TYPE, string>> = {
  [CHAIN_TYPE.EVM]: 'ethLike',
  [CHAIN_TYPE.TRON]: 'tron'
};
