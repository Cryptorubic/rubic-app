import { PRIVATE_MODE_TAB, PrivateModeTab } from '@app/features/privacy/constants/private-mode-tab';
import {
  PRIVATE_TRADE_TYPE,
  PrivateTradeType
} from '@app/features/privacy/constants/private-trade-types';

export interface FormSteps {
  token1: boolean;
  token2: boolean;
  approve: boolean;
}

export enum GA_ERRORS_CATEGORY {
  APPROVE_CROSS_CHAIN_SWAP = 'approve-cross-chain-swap-error',
  CROSS_CHAIN_SWAP = 'cross-chain-swap-error',
  CHANGENOW_CROSS_CHAIN_SWAP = 'changenow-cross-chain-swap-error',
  APPROVE_ON_CHAIN_SWAP = 'approve-on-chain-swap-error',
  ON_CHAIN_SWAP = 'on-chain-swap-error'
}

export type SwitchModeEvent = 'regular' | 'private' | 'testnets';

export type PrivateFlowTabEvent = 'on_chain' | 'cross_chain' | 'transfer';

export const PRIVATE_TAB_TO_FLOW_TYPE_EVENT: Record<PrivateModeTab, PrivateFlowTabEvent> = {
  [PRIVATE_MODE_TAB.ON_CHAIN]: 'on_chain',
  [PRIVATE_MODE_TAB.CROSS_CHAIN]: 'cross_chain',
  [PRIVATE_MODE_TAB.TRANSFER]: 'transfer'
};

export type PrivateProviderNameEvent =
  | 'hinkal'
  | 'privacy_cash'
  | 'clearswap'
  | 'houdini'
  | 'zama'
  | 'railgun';

export const PRIVATE_TRADE_TYPE_TO_PROVIDER_NAME_EVENT: Record<
  PrivateTradeType,
  PrivateProviderNameEvent
> = {
  [PRIVATE_TRADE_TYPE.HINKAL]: 'hinkal',
  [PRIVATE_TRADE_TYPE.PRIVACY_CASH]: 'privacy_cash',
  [PRIVATE_TRADE_TYPE.CLEARSWAP]: 'clearswap',
  [PRIVATE_TRADE_TYPE.HOUDINI]: 'houdini',
  [PRIVATE_TRADE_TYPE.ZAMA]: 'zama',
  [PRIVATE_TRADE_TYPE.RAILGUN]: 'railgun'
};
