import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';

export type TrustlineType = 'default' | 'refund' | 'transit';

function getBlockchainName(blockchain: BlockchainName): string {
  return blockchain === BLOCKCHAIN_NAME.STELLAR ? 'Stellar' : 'Ripple';
}

export const TRUSTLINE_TYPE_TEXT: Record<
  TrustlineType,
  (symbol: string, blockchain: BlockchainName) => string
> = {
  default: (symbol, blockchain) =>
    `To get the Asset ${symbol}, you need to add its support to your ${getBlockchainName(
      blockchain
    )} wallet (trustline).`,
  transit: (symbol, blockchain) =>
    `To execute this swap, set a trustline for the transit ${symbol} tokens in your ${getBlockchainName(
      blockchain
    )} wallet.`,
  refund: (symbol, blockchain) =>
    `To receive your refund ${symbol}, please add a trustline in your ${getBlockchainName(
      blockchain
    )} wallet.`
};
