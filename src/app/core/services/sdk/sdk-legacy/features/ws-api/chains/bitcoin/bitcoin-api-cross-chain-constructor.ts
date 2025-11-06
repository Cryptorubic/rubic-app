import { BitcoinBlockchainName } from '@cryptorubic/core';

import { ApiCrossChainConstructor } from '../../models/api-cross-chain-constructor';

export interface BitcoinApiCrossChainConstructor
  extends ApiCrossChainConstructor<BitcoinBlockchainName> {
  needProvidePubKey: boolean;
}
