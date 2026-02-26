import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { NetworkName } from '@railgun-community/shared-models';

export const fromPrivateToRubicChainMap = {
  [NetworkName.Ethereum]: BLOCKCHAIN_NAME.ETHEREUM,
  [NetworkName.BNBChain]: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  [NetworkName.Polygon]: BLOCKCHAIN_NAME.POLYGON,
  [NetworkName.Arbitrum]: BLOCKCHAIN_NAME.ARBITRUM
} as const satisfies Record<PrivacySupportedNetworks, BlockchainName>;

export const fromRubicToPrivateChainMap = Object.fromEntries(
  Object.entries(fromPrivateToRubicChainMap).map(([privateChain, rubicChain]) => [
    rubicChain,
    privateChain
  ])
) as Record<BlockchainName, PrivacySupportedNetworks>;
