import { SolanaBlockchainName } from '@cryptorubic/core';

import { ApiOnChainConstructor } from '../../models/api-on-chain-constructor';

export interface SolanaApiOnChainConstructor extends ApiOnChainConstructor<SolanaBlockchainName> {
    shouldCalculateConsumedParams: boolean;
}
