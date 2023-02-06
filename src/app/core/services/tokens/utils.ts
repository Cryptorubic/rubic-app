import { BlockchainName } from 'rubic-sdk';

export function areTokensEqual(
  token0: { blockchain: BlockchainName; address: string },
  token1: { blockchain: BlockchainName; address: string }
): boolean {
  return (
    token0?.blockchain === token1?.blockchain &&
    token0?.address?.toLowerCase() === token1?.address?.toLowerCase()
  );
}
