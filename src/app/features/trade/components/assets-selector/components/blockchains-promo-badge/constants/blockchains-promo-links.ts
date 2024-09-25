import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';

export const blockchainsPromoLinks: BlockchainsPromoLinks = {
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'https://app.layer3.xyz/streaks/swap-on-rubic',
  [BLOCKCHAIN_NAME.ZK_SYNC]: 'https://www.intract.io/quest/6659a29721949f76bb4714df',
  [BLOCKCHAIN_NAME.MODE]: 'https://app.layer3.xyz/quests/rubic-on-mode?slug=rubic-on-mode',
  [BLOCKCHAIN_NAME.BLAST]:
    'https://app.layer3.xyz/quests/blast-through-rubic-exchange?slug=blast-through-rubic-exchange',
  [BLOCKCHAIN_NAME.METIS]: 'https://app.layer3.xyz/quests/bridging-the-gap',
  [BLOCKCHAIN_NAME.TAIKO]:
    'https://rubic.exchange/blog/how-to-bridge-to-and-from-taiko-and-get-taiko-airdrop/',
  [BLOCKCHAIN_NAME.MERLIN]: 'https://app.galxe.com/quest/Rubic/GC6FstdPpK',
  [BLOCKCHAIN_NAME.ZK_LINK]:
    'https://rubic.exchange/blog/bridge-to-zklink-network-and-get-extra-nova-points/',
  [BLOCKCHAIN_NAME.HORIZEN_EON]: 'https://app.galxe.com/quest/horizen/GCJZxtzTvN',
  [BLOCKCHAIN_NAME.XLAYER]: 'https://app.layer3.xyz/quests/x-layer-exploration-rubic',
  [BLOCKCHAIN_NAME.ROOTSTOCK]:
    'https://www.intract.io/quest/667d6f70010a0189758ca622?utm_source=dashboard',
  [BLOCKCHAIN_NAME.SCROLL]: 'https://rubic.exchange/birthday4'
};
type BlockchainsPromoLinks = Partial<Record<BlockchainName, string>>;
