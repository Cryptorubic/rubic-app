import { TonBlockchainName } from '@cryptorubic/core';

import { ApiOnChainConstructor } from '../../models/api-on-chain-constructor';

export interface TonApiOnChainConstructor extends ApiOnChainConstructor<TonBlockchainName> {
  isChangedSlippage: boolean;
}
