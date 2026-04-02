import { PRIVATE_TRADE_TYPE } from './private-trade-types';
import { PRIVATE_PROVIDERS_TABS_MAP } from './private-providers-tabs-map';
import { PRIVATE_MODE_TAB, PrivateModeTab } from './private-mode-tab';
import { PRIVATE_PROVIDERS_CHAINS_MAP } from './private-providers-chains-map';
import { BlockchainName } from '@cryptorubic/core';

function getBlockchainsByTab(tab: PrivateModeTab): BlockchainName[] {
  return [
    ...new Set(
      Object.values(PRIVATE_TRADE_TYPE)
        .filter(privateTradeType => PRIVATE_PROVIDERS_TABS_MAP[privateTradeType].includes(tab))
        .map(privateTradeType => PRIVATE_PROVIDERS_CHAINS_MAP[privateTradeType])
        .flat()
    )
  ];
}

export const PRIVATE_MODE_SUPPORTED_CHAINS: Record<PrivateModeTab, BlockchainName[]> = {
  [PRIVATE_MODE_TAB.ON_CHAIN]: getBlockchainsByTab(PRIVATE_MODE_TAB.ON_CHAIN),
  [PRIVATE_MODE_TAB.CROSS_CHAIN]: getBlockchainsByTab(PRIVATE_MODE_TAB.CROSS_CHAIN),
  [PRIVATE_MODE_TAB.TRANSFER]: getBlockchainsByTab(PRIVATE_MODE_TAB.TRANSFER)
};
