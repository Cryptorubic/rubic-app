import { BlockchainName } from '@cryptorubic/core';
import { TrustlineToken } from './trustline-token';
import { TrustlineType } from './trustline-type';

export interface TrustlineComponentOptions {
  toBlockchain: BlockchainName;
  trustlineToken: TrustlineToken;
  trustlineType: TrustlineType;
  receiver?: string;
}
