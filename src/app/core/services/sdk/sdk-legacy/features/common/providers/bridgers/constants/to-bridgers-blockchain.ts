import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { BridgersCrossChainSupportedBlockchain } from '../../../../cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';

export const toBridgersBlockchain: Record<BridgersCrossChainSupportedBlockchain, string> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BSC',
  [BLOCKCHAIN_NAME.POLYGON]: 'POLYGON',
  [BLOCKCHAIN_NAME.FANTOM]: 'FANTOM',
  [BLOCKCHAIN_NAME.TRON]: 'TRX'
};
