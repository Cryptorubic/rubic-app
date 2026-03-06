import { PrivateAction } from '@app/features/privacy/constants/private-mode-tx-types';
import { RAILGUN_SUPPORTED_CHAINS, RailgunSupportedChain } from './network-map';

export const RAILGUN_SUPPORTED_ACTIONS = RAILGUN_SUPPORTED_CHAINS.reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: ['Swap', 'Transfer']
  }),
  {} as Record<RailgunSupportedChain, Readonly<PrivateAction[]>>
);
