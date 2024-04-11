import { WrappedSdkTrade } from '@features/trade/models/wrapped-sdk-trade';
import { CrossChainTrade, OnChainTrade, RubicStep } from 'rubic-sdk';

interface TradefullState {
  trade: WrappedSdkTrade['trade'];
  error: null | WrappedSdkTrade['error'];
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
  routes: RubicStep[];
  badges?: BadgeInfo[];
};

export interface BadgeInfo {
  label: string;
  fromSdk: boolean;
  bgColor?: string;
  showLabel: (trade: CrossChainTrade | OnChainTrade) => boolean;
  hint?: string;
  href?: string;
}
