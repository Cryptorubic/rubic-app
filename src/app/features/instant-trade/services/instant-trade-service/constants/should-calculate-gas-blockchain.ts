import { BLOCKCHAIN_NAME, EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';

export const SHOULD_CALCULATE_GAS_BLOCKCHAIN: Record<EthLikeBlockchainName, boolean> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: true,
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: false,
  [BLOCKCHAIN_NAME.POLYGON]: false,
  [BLOCKCHAIN_NAME.HARMONY]: false,
  [BLOCKCHAIN_NAME.AVALANCHE]: true,
  [BLOCKCHAIN_NAME.FANTOM]: true,
  [BLOCKCHAIN_NAME.ARBITRUM]: false,
  [BLOCKCHAIN_NAME.AURORA]: false,
  [BLOCKCHAIN_NAME.TELOS]: true,
  [BLOCKCHAIN_NAME.MOONRIVER]: false
};
