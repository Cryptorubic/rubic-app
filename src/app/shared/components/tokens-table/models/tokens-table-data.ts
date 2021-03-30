import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';

export interface TokensTableData extends OrderBookTradeData {
  expiresIn?: moment.Duration;
}
