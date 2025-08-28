import { BadgeInfo } from '@app/features/trade/models/trade-state';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/sdk';
import {
  showScrollMarksPromoLabel,
  showTaikoPointsPromoLabel,
  showZkLinkPointsLabel
} from './common/badges-for-chains-conditions';

export const SPECIFIC_BADGES_FOR_CHAINS: Partial<Record<BlockchainName, BadgeInfo[]>> = {
  [BLOCKCHAIN_NAME.ZK_LINK]: [
    {
      fromSdk: false,
      bgColor: 'linear-gradient(0deg, rgba(39,153,104,1) 0%, rgba(42,189,143,1) 100%)',
      getUrl: () =>
        'https://rubic.exchange/blog/bridge-to-zklink-network-and-get-extra-nova-points/',
      getLabel: () => '+ Nova and Rubic Points',
      getHint: () =>
        'Double RBC points for all transactions and 1 Nova point for every transaction.',
      showLabel: showZkLinkPointsLabel
    }
  ],
  [BLOCKCHAIN_NAME.TAIKO]: [
    {
      bgColor: '#d112c5',
      fromSdk: false,
      getHint: () =>
        'Join Taiko Trailblazers, earn XPs on all swaps with Taiko & get a potential $TKO airdrop with Rubic.',
      getLabel: () => '+Points!',
      showLabel: showTaikoPointsPromoLabel
    }
  ],
  [BLOCKCHAIN_NAME.SCROLL]: [
    {
      getUrl: () => 'https://scroll.io/sessions',
      bgColor: '#BDA584',
      fromSdk: false,
      getLabel: () => '+Marks!',
      getHint: () =>
        'You will recieve Marks from Scroll for completing this swap and holding this token!',
      showLabel: showScrollMarksPromoLabel
    }
  ]
};
