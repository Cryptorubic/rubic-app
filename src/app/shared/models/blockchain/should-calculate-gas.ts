import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export const shouldCalculateGas: Record<BlockchainName, boolean> = {
  ...Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: false }),
    {} as Record<BlockchainName, boolean>
  ),
  [BLOCKCHAIN_NAME.AVALANCHE]: true,
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: true,
  [BLOCKCHAIN_NAME.ETHEREUM]: true,
  [BLOCKCHAIN_NAME.POLYGON]: true,
  [BLOCKCHAIN_NAME.ARBITRUM]: true,
  [BLOCKCHAIN_NAME.ZK_SYNC]: true,
  [BLOCKCHAIN_NAME.BASE]: true,
  [BLOCKCHAIN_NAME.LINEA]: true,
  [BLOCKCHAIN_NAME.MANTLE]: true,
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: true,
  [BLOCKCHAIN_NAME.SCROLL]: true,
  [BLOCKCHAIN_NAME.OPTIMISM]: true,
  [BLOCKCHAIN_NAME.MANTA_PACIFIC]: true,
  [BLOCKCHAIN_NAME.FANTOM]: true,
  [BLOCKCHAIN_NAME.BLAST]: true,
  [BLOCKCHAIN_NAME.BERACHAIN]: true
};
