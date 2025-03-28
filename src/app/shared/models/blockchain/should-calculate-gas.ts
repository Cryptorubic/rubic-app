import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export const shouldCalculateGas: Record<BlockchainName, boolean> = {
  ...Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: false }),
    {} as Record<BlockchainName, boolean>
  ),
  [BLOCKCHAIN_NAME.MEGAETH_TESTNET]: true
};
