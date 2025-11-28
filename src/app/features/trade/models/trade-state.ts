import { WrappedSdkTrade } from '@features/trade/models/wrapped-sdk-trade';
import { SolanaGaslessStateService } from '../services/solana-gasless/solana-gasless-state.service';
import { RubicStep } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';

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
};

export interface BadgeInfo {
  fromSdk: boolean;
  showLabel: (trade: CrossChainTrade | OnChainTrade) => boolean;
  getBgColor?: (trade: CrossChainTrade | OnChainTrade, services: BadgeInfoServices) => string;
  getLabel: (trade: CrossChainTrade | OnChainTrade) => string;
  getHint?: (trade: CrossChainTrade | OnChainTrade) => string;
  getUrl?: (trade: CrossChainTrade | OnChainTrade) => string;
}

export interface BadgeInfoServices {
  solanaGaslessStateService: SolanaGaslessStateService;
}

export interface BadgeInfoForComponent {
  label: string;
  bgColor?: string;
  hint?: string;
  href?: string;
}
