import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';

export const blockchainsPromoLinks: BlockchainsPromoLinks = {
  [BLOCKCHAIN_NAME.LINEA]: 'https://quest.intract.io/quest/6752c2eb51cb95ea423cc3ba',
  [BLOCKCHAIN_NAME.FRAXTAL]: 'https://app.layer3.xyz/quests/fraxtal-campaign-rubic-exchange',
  [BLOCKCHAIN_NAME.GRAVITY]: 'https://app.galxe.com/quest/Rubic/GCMCwtoAd4'
};
type BlockchainsPromoLinks = Partial<Record<BlockchainName, string>>;
