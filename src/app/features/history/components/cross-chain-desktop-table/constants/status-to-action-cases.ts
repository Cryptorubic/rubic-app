import { BLOCKCHAIN_NAME, CHAIN_TYPE } from '@cryptorubic/core';
import { TableRowWithActionButton } from '../model/types';
import { BRIDGE_PROVIDERS } from '@app/features/trade/constants/bridge-providers';
import { BRIDGE_TYPE } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/bridge-type';

/**
 * for claim-status in arbitrum bridge needs to show button with specific action
 */
export const tableRowsWithActionButtons = [
  //   { provider: BRIDGE_PROVIDERS[BRIDGE_TYPE.SYMBIOSIS], status: 'Revert' },
  {
    provider: BRIDGE_PROVIDERS[BRIDGE_TYPE.ARBITRUM],
    fromBlockchain: BLOCKCHAIN_NAME.ARBITRUM,
    status: 'Claim',
    toChainType: CHAIN_TYPE.EVM
  },
  {
    provider: BRIDGE_PROVIDERS[BRIDGE_TYPE.RUBIC_STELLAR_API],
    status: 'Refund',
    toChainType: CHAIN_TYPE.STELLAR
  }
] as TableRowWithActionButton[];
