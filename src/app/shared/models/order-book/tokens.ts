export type OrderBookTokenPart = 'from' | 'to';

export interface TokenValueType {
  value: string;
  tokenType: OrderBookTokenPart;
}
