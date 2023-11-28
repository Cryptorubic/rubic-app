import { FROM_BACKEND_CROSS_CHAIN_PROVIDERS } from '@app/core/services/backend/cross-chain-routing-api/constants/from-backend-cross-chain-providers';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { TableRowWithActionButton } from '../model/types';

/**
 * for claim-status in arbitrum bridge needs to show button with specific action
 */
export const tableRowsWithActionButtons = [
  // @TODO RUBIC-2017 Add revert button for symbiosis provider
  //   { provider: FROM_BACKEND_CROSS_CHAIN_PROVIDERS.symbiosis, status: 'Revert' },
  {
    provider: FROM_BACKEND_CROSS_CHAIN_PROVIDERS.rbc_arbitrum_bridge,
    fromBlockchain: BLOCKCHAIN_NAME.ARBITRUM,
    status: 'Claim'
  }
] as TableRowWithActionButton[];
