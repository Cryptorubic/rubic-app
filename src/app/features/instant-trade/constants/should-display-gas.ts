import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

/**
 * Defines for each blockchain whether to display gas in instant trade bottom panel.
 */
export const SHOULD_DISPLAY_GAS = {
  [BLOCKCHAIN_NAME.ETHEREUM]: true,
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: false,
  [BLOCKCHAIN_NAME.POLYGON]: false,
  [BLOCKCHAIN_NAME.HARMONY]: false,
  [BLOCKCHAIN_NAME.AVALANCHE]: false
};
