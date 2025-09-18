import { BadgeInfo, BadgeInfoServices } from '@app/features/trade/models/trade-state';
import { BLOCKCHAIN_NAME, BlockchainName, CrossChainTrade, OnChainTrade } from '@cryptorubic/sdk';
import {
  showScrollMarksPromoLabel,
  showSolanaGaslessLabel,
  showTaikoPointsPromoLabel,
  showZkLinkPointsLabel
} from './common/badges-for-chains-conditions';
import { checkAmountGte100Usd } from '../../solana-gasless/utils/solana-utils';

export const SPECIFIC_BADGES_FOR_CHAINS: Partial<Record<BlockchainName, BadgeInfo[]>> = {
  [BLOCKCHAIN_NAME.ZK_LINK]: [
    {
      fromSdk: false,
      getBgColor: () => 'linear-gradient(0deg, rgba(39,153,104,1) 0%, rgba(42,189,143,1) 100%)',
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
      fromSdk: false,
      getBgColor: () => '#d112c5',
      getHint: () =>
        'Join Taiko Trailblazers, earn XPs on all swaps with Taiko & get a potential $TKO airdrop with Rubic.',
      getLabel: () => '+Points!',
      showLabel: showTaikoPointsPromoLabel
    }
  ],
  [BLOCKCHAIN_NAME.SCROLL]: [
    {
      fromSdk: false,
      getUrl: () => 'https://scroll.io/sessions',
      getBgColor: () => '#BDA584',
      getLabel: () => '+Marks!',
      getHint: () =>
        'You will recieve Marks from Scroll for completing this swap and holding this token!',
      showLabel: showScrollMarksPromoLabel
    }
  ],
  [BLOCKCHAIN_NAME.SOLANA]: [
    {
      fromSdk: false,
      getBgColor: (trade: CrossChainTrade | OnChainTrade, services: BadgeInfoServices) => {
        const madeLessThan5GaslessSwaps = services.solanaGaslessStateService.madeLessThan5Txs;
        return checkAmountGte100Usd(trade) && madeLessThan5GaslessSwaps
          ? 'linear-gradient(0deg, rgba(193,9,255,1) 6%, rgba(4,200,133,1) 100%)'
          : '#3B3D4E';
      },
      getLabel: () => 'GASLESS',
      getHint: () =>
        'Gasless? Yep. On Solana, Rubic pays your gas fees for 5 swaps over $100 every day!',
      showLabel: showSolanaGaslessLabel
    }
  ]
};
