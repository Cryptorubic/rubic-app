import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export const shouldCalculateGas: Record<BlockchainName, boolean> = {
  ...Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: false }),
    {} as Record<BlockchainName, boolean>
  ),
  [BLOCKCHAIN_NAME.ETHEREUM]: true,
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: true,
  [BLOCKCHAIN_NAME.POLYGON]: true,
  [BLOCKCHAIN_NAME.AVALANCHE]: true,
  [BLOCKCHAIN_NAME.FANTOM]: true,
  [BLOCKCHAIN_NAME.TELOS]: true,
  [BLOCKCHAIN_NAME.ETHEREUM_POW]: true,
  [BLOCKCHAIN_NAME.ARBITRUM]: true,
  [BLOCKCHAIN_NAME.ZK_SYNC]: true,
  [BLOCKCHAIN_NAME.OPTIMISM]: true
};
