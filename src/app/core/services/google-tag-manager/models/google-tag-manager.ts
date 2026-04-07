import { PRIVATE_MODE_TAB, PrivateModeTab } from '@app/features/privacy/constants/private-mode-tab';

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
