import { BlockchainName } from '@cryptorubic/core';
import { PrivateTradeType } from './private-trade-types';
import { PRIVATE_MODE_TAB, PrivateModeTab } from './private-mode-tab';
import {
  HINKAL_SUPPORTED_CHAINS,
  HinkalSupportedChain
} from '@app/features/privacy/providers/hinkal/constants/chains';
import { PrivacycashSupportedChain } from '@app/features/privacy/providers/privacycash/constants/chains';
import { ZamaSupportedChain } from '@app/features/privacy/providers/zama/constants/chains';
import {
  RAILGUN_SUPPORTED_CHAINS,
  RailgunSupportedChain
} from '@app/features/privacy/providers/railgun/constants/network-map';
import { ClearswapSupportedChain } from '@app/features/privacy/providers/clearswap/constants/clearswap-supported';
import {
  HOUDINI_SUPPORTED_CHAINS,
  HoudiniSupportedChain
} from '@app/features/privacy/providers/houdini/constants/chains';

const HINKAL_SUPPORTED_TABS = HINKAL_SUPPORTED_CHAINS.reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: [PRIVATE_MODE_TAB.CROSS_CHAIN, PRIVATE_MODE_TAB.ON_CHAIN, PRIVATE_MODE_TAB.TRANSFER]
  }),
  {} as Record<HinkalSupportedChain, Readonly<PrivateModeTab[]>>
);

const PRIVACYCAH_SUPPORTED_TABS: Record<PrivacycashSupportedChain, Readonly<PrivateModeTab[]>> = {
  SOLANA: [PRIVATE_MODE_TAB.CROSS_CHAIN, PRIVATE_MODE_TAB.ON_CHAIN, PRIVATE_MODE_TAB.TRANSFER]
} as const;

const ZAMA_SUPPORTED_ACTIONS: Record<ZamaSupportedChain, Readonly<PrivateModeTab[]>> = {
  ETH: [PRIVATE_MODE_TAB.TRANSFER]
};

const RAILGUN_SUPPORTED_TABS = RAILGUN_SUPPORTED_CHAINS.reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: [PRIVATE_MODE_TAB.CROSS_CHAIN, PRIVATE_MODE_TAB.ON_CHAIN, PRIVATE_MODE_TAB.TRANSFER]
  }),
  {} as Record<RailgunSupportedChain, Readonly<PrivateModeTab[]>>
);

const CLEARSWAP_SUPPORTED_TABS: Record<ClearswapSupportedChain, Readonly<PrivateModeTab[]>> = {
  TRON: [PRIVATE_MODE_TAB.CROSS_CHAIN, PRIVATE_MODE_TAB.ON_CHAIN, PRIVATE_MODE_TAB.TRANSFER]
} as const;

const HOUDINI_SUPPORTED_TABS = HOUDINI_SUPPORTED_CHAINS.reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: [PRIVATE_MODE_TAB.CROSS_CHAIN, PRIVATE_MODE_TAB.ON_CHAIN]
  }),
  {} as Record<HoudiniSupportedChain, Readonly<PrivateModeTab[]>>
);

export const PRIVATE_PROVIDERS_TABS_MAP: Record<
  PrivateTradeType,
  Partial<Record<BlockchainName, Readonly<PrivateModeTab[]>>>
> = {
  HINKAL: HINKAL_SUPPORTED_TABS,
  PRIVACY_CASH: PRIVACYCAH_SUPPORTED_TABS,
  ZAMA: ZAMA_SUPPORTED_ACTIONS,
  RAILGUN: RAILGUN_SUPPORTED_TABS,
  CLEARSWAP: CLEARSWAP_SUPPORTED_TABS,
  HOUDINI: HOUDINI_SUPPORTED_TABS
};
