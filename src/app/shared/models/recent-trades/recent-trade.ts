import { CrossChainRecentTrade } from '@shared/models/recent-trades/cross-chain-recent-trade';
import { OnramperRecentTrade } from '@shared/models/recent-trades/onramper-recent-trade';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';

export type RecentTrade = CrossChainRecentTrade | OnramperRecentTrade | ChangenowPostTrade;
