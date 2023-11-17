import { FROM_BACKEND_CROSS_CHAIN_PROVIDERS } from '@app/core/services/backend/cross-chain-routing-api/constants/from-backend-cross-chain-providers';
import { CrossChainTradeType } from 'rubic-sdk';

export const CASES_WHEN_SHOW_BUTTON_IN_STATUS_TO = [
  // @TODO RUBIC-2017 Add revert button for symbiosis provider
  //   { provider: FROM_BACKEND_CROSS_CHAIN_PROVIDERS.symbiosis, status: 'Revert' },
  { provider: FROM_BACKEND_CROSS_CHAIN_PROVIDERS.rbc_arbitrum_bridge, status: 'Claim' }
] as Array<{ provider: CrossChainTradeType; status: string }>;
