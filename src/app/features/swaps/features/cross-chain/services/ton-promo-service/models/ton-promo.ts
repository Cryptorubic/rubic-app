export interface FetchedTonPromoInfo {
  is_active: boolean;
  confirmed_rewards_amount: number;
}

export interface TonPromoUserInfo {
  confirmed_trades: number;
}

export interface TonPromoInfo extends FetchedTonPromoInfo, TonPromoUserInfo {}

export interface ShortTonPromoInfo {
  isTonPromoTrade: boolean;
  totalUserConfirmedTrades: number;
}
