import { OrderBookTradeData } from 'src/app/features/order-book-trade-page-old/models/trade-data';
import { InstantTradesTradeData } from '../../../../features/swaps-page-old/models/trade-data';

export type TradeData = OrderBookTradeData | InstantTradesTradeData;
