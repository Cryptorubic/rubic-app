import InstantTrade from '@features/instant-trade/models/instant-trade';

export interface OneinchInstantTrade extends InstantTrade {
  /**
   * Transaction data to send.
   * Equals `null` if data wasn't retrieved from api.
   */
  data: string | null;
}
