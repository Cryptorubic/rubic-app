import { BLOCKCHAIN_NAME, BRIDGE_TYPE } from 'rubic-sdk';
import { TableRowWithActionButton } from '../model/types';
import { BRIDGE_PROVIDERS } from '@app/features/trade/constants/bridge-providers';

/**
 * for claim-status in arbitrum bridge needs to show button with specific action
 */
export const tableRowsWithActionButtons = [
  // @TODO RUBIC-2017 Add revert button for symbiosis provider
  //   { provider: BRIDGE_PROVIDERS[BRIDGE_TYPE.SYMBIOSIS], status: 'Revert' },
  {
    provider: BRIDGE_PROVIDERS[BRIDGE_TYPE.ARBITRUM],
    fromBlockchain: BLOCKCHAIN_NAME.ARBITRUM,
    status: 'Claim'
  }
] as TableRowWithActionButton[];
