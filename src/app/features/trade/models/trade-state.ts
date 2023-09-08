import { WrappedSdkTrade } from '@features/trade/models/wrapped-sdk-trade';
import { RouteStep } from '@features/trade/models/route-step';

interface TradefullState {
  trade: WrappedSdkTrade['trade'];
  error: null;
  // warnings - Min/Max amounts errors
  tradeType: WrappedSdkTrade['tradeType'];
}

interface TradelessState {
  trade: null;
  error: WrappedSdkTrade['error'];
  // warnings - Min/Max amounts errors
  tradeType: WrappedSdkTrade['tradeType'];
}

export type TradeState = (TradefullState | TradelessState) & {
  tags: {
    isBest: boolean;
    cheap: boolean;
  };
  needApprove: boolean;
  routes: RouteStep[];
};
