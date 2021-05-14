import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { InstantTradesTradeData } from '../../../../features/swaps-page/models/trade-data';

export type TradeData = OrderBookTradeData | InstantTradesTradeData;
