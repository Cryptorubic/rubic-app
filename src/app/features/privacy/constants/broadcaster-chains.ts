import { fromPrivateToRubicChainMap } from '@features/privacy/constants/network-map';
import { blockchainId } from '@cryptorubic/core';
import { PrivacySupportedNetworks } from '@features/privacy/models/supported-networks';

export const broadcasterChains = Object.fromEntries(
  Object.entries(fromPrivateToRubicChainMap).map(([privateChain, rubicChain]) => [
    privateChain,
    { type: 0, id: blockchainId[rubicChain] }
  ])
) as Record<PrivacySupportedNetworks, { type: 0; id: number }>;
