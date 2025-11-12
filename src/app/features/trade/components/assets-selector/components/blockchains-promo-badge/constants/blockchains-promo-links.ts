import { BlockchainName, BLOCKCHAIN_NAME } from '@cryptorubic/sdk';

export const blockchainsPromoLinks: BlockchainsPromoLinks = {
  [BLOCKCHAIN_NAME.ZK_SYNC]: 'https://www.intract.io/quest/6659a29721949f76bb4714df',
  [BLOCKCHAIN_NAME.BASE]: 'https://quest.intract.io/quest/660d3f8e0f5e5a9e8235549b',
  [BLOCKCHAIN_NAME.LINEA]: 'https://quest.intract.io/quest/660d3ed80f5e5a9e8235471f',
  [BLOCKCHAIN_NAME.BLAST]: 'https://quest.intract.io/quest/660d3ed70f5e5a9e823546cc',
  [BLOCKCHAIN_NAME.SCROLL]: 'https://quest.intract.io/quest/660d3f100f5e5a9e82354bea'
};

type BlockchainsPromoLinks = Partial<Record<BlockchainName, string>>;
