import { BadgeInfo } from '@app/features/trade/models/trade-state';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import {
  showMerlinLabel,
  showScrollMarksPromoLabel,
  showTaikoPointsPromoLabel,
  showXLayerPromoLabel,
  showZkLinkPointsLabel
} from './common/badges-for-chains-conditions';
import { PURPLE_COLOR } from './common/badges-ui';

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
  ],
  [BLOCKCHAIN_NAME.BLAST]: [],
  [BLOCKCHAIN_NAME.MERLIN]: [
    {
      bgColor: PURPLE_COLOR,
      fromSdk: false,
      getHint: () => 'Swap to/from/on Merlin with zero Rubic fees!',
      getLabel: () => '0 fees',
      showLabel: showMerlinLabel
    }
  ],
  [BLOCKCHAIN_NAME.TAIKO]: [
    {
      bgColor: '#d112c5',
      fromSdk: false,
      getHint: () =>
        'Swap to/from/on Taiko with 50% reduced protocol fees to get XPs for the future rewards from Taiko.',
      getLabel: () => '+Points!',
      showLabel: showTaikoPointsPromoLabel
    }
  ],
  [BLOCKCHAIN_NAME.XLAYER]: [
    {
      bgColor: 'rgb(187 77 33)',
      fromSdk: false,
      getUrl: () =>
        'https://rubic.exchange/blog/bridge-to-and-from-x-layer-with-rubic-reduced-fees-and-seamless-swaps/',
      getHint: () => 'Swap with 50% reduced fees on/to X Layer!',
      getLabel: () => '-50% fees',
      showLabel: showXLayerPromoLabel
    }
  ]
};
