import { BRIDGE_TYPE } from 'rubic-sdk';
import { TableRowWithActionButton } from '../model/types';
import { BRIDGE_PROVIDERS } from '@app/features/trade/constants/bridge-providers';

/**
 * for claim-status in arbitrum bridge and Symbiosis-revert needs to show button with specific action
 */
export const tableRowsWithActionButtons: TableRowWithActionButton[] = [
  { provider: BRIDGE_PROVIDERS[BRIDGE_TYPE.SYMBIOSIS], status: 'Revert' },
  {
    provider: BRIDGE_PROVIDERS[BRIDGE_TYPE.ARBITRUM],
    // fromBlockchain: BLOCKCHAIN_NAME.ARBITRUM,
    status: 'Claim'
  }
];
