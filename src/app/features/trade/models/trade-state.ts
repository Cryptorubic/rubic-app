import { WrappedSdkTrade } from '@features/trade/models/wrapped-sdk-trade';
import { CrossChainTrade, OnChainTrade, RubicStep } from 'rubic-sdk';
import { CentralizationStatus } from '../constants/centralization-status';

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
  needAuthWallet?: boolean;
  routes: RubicStep[];
  badges?: BadgeInfoForComponent[];
  centralizationStatus: CentralizationStatus;
};

export interface BadgeInfo {
  fromSdk: boolean;
  bgColor?: string;
  showLabel: (trade: CrossChainTrade | OnChainTrade) => boolean;
  getLabel: (trade: CrossChainTrade | OnChainTrade) => string;
  getHint?: (trade: CrossChainTrade | OnChainTrade) => string;
  getUrl?: (trade: CrossChainTrade | OnChainTrade) => string;
}

export interface BadgeInfoForComponent {
  label: string;
  bgColor?: string;
  hint?: string;
  href?: string;
}
