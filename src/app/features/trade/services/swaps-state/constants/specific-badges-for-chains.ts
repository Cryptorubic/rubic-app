import { BadgeInfo } from '@app/features/trade/models/trade-state';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import {
  showBlastGoldPromoLabel,
  showScrollMarksPromoLabel,
  showZkLinkPointsLabel
} from './common/badges-for-chains-conditions';
import { GOLD_COLOR } from './common/badges-ui';

export const SPECIFIC_BADGES_FOR_CHAINS: Partial<Record<BlockchainName, BadgeInfo[]>> = {
  [BLOCKCHAIN_NAME.ZK_LINK]: [
    {
      fromSdk: false,
      bgColor: 'linear-gradient(0deg, rgba(39,153,104,1) 0%, rgba(42,189,143,1) 100%)',
      href: 'https://rubic.exchange/blog/bridge-to-zklink-network-and-get-extra-nova-points/',
      getLabel: () => '+ Nova and Rubic Points',
      getHint: () =>
        'Double RBC points for all transactions and 1 Nova point for every transaction.',
      showLabel: showZkLinkPointsLabel
    }
  ],
  [BLOCKCHAIN_NAME.SCROLL]: [
    {
      href: 'https://scroll.io/sessions',
      bgColor: '#BDA584',
      fromSdk: false,
      getLabel: () => '+Marks!',
      getHint: () =>
        'You will recieve Marks from Scroll for completing this swap and holding this token!',
      showLabel: showScrollMarksPromoLabel
    }
  ],
  [BLOCKCHAIN_NAME.BLAST]: [
    {
      bgColor: GOLD_COLOR,
      fromSdk: false,
      getHint: () => 'You will recieve Blast Gold from Rubic team for this transaction!',
      getLabel: () => '+Gold',
      showLabel: showBlastGoldPromoLabel
    }
  ]
};
