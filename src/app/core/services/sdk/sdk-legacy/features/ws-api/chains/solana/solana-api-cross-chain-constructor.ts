import { SolanaBlockchainName } from '@cryptorubic/core';

import { ApiCrossChainConstructor } from '../../models/api-cross-chain-constructor';

export interface SolanaApiCrossChainConstructor extends ApiCrossChainConstructor<SolanaBlockchainName> {
    shouldCalculateConsumedParams: boolean;
}
