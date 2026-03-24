import { PrivateTradeType } from '@features/privacy/constants/private-trade-types';

export type PrivateAction =
  | 'TRANSFER'
  | 'SHIELD'
  | 'UNSHIELD'
  | 'PRIVATE_ONCHAIN_SWAP'
  | 'PRIVATE_CROSSCHAIN_SWAP'
  | 'REFUND';

export type PrivateProvider = PrivateTradeType;
