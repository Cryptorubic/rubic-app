import { CrossChainRecentTrade } from '@shared/models/recent-trades/cross-chain-recent-trade';
import { OnramperRecentTrade } from '@shared/models/recent-trades/onramper-recent-trade';

export type RecentTrade = CrossChainRecentTrade | OnramperRecentTrade;
