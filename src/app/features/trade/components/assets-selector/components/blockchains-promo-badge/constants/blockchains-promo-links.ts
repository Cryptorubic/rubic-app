import { BlockchainName, BLOCKCHAIN_NAME } from '@cryptorubic/core';

export const blockchainsPromoLinks: BlockchainsPromoLinks = {
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'https://app.layer3.xyz/streaks/swap-on-rubic',
  [BLOCKCHAIN_NAME.ZK_SYNC]: 'https://www.intract.io/quest/6659a29721949f76bb4714df',
  [BLOCKCHAIN_NAME.MODE]: 'https://app.layer3.xyz/quests/rubic-on-mode?slug=rubic-on-mode',
  [BLOCKCHAIN_NAME.BLAST]:
    'https://app.layer3.xyz/quests/blast-through-rubic-exchange?slug=blast-through-rubic-exchange',
  [BLOCKCHAIN_NAME.TAIKO]:
    'https://rubic.exchange/blog/how-to-bridge-to-and-from-taiko-and-get-taiko-airdrop/',
  [BLOCKCHAIN_NAME.SCROLL]: 'https://rubic.exchange/birthday4',
  [BLOCKCHAIN_NAME.UNICHAIN]: 'https://app.layer3.xyz/activations/unichain-rubic',
  [BLOCKCHAIN_NAME.SONEIUM]: 'https://app.layer3.xyz/activations/superchain-enjoyeers-rubic'
};
type BlockchainsPromoLinks = Partial<Record<BlockchainName, string>>;
