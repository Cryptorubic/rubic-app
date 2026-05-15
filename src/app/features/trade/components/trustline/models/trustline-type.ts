export type TrustlineType = 'default' | 'refund' | 'transit';

export const TRUSTLINE_TYPE_TEXT: Record<TrustlineType, (symbol: string) => string> = {
  default: symbol =>
    `To get the Asset ${symbol}, you need to add its support to your Stellar wallet (trustline).`,
  transit: symbol =>
    `To execute this swap, set a trustline for the transit ${symbol} tokens in your Stellar wallet.`,
  refund: symbol =>
    `To receive your refund ${symbol}, please add a trustline in your Stellar wallet.`
};
