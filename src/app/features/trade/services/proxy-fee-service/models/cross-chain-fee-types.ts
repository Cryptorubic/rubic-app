import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
import { TokenType } from '@features/trade/services/proxy-fee-service/models/token-type';
import { FeeValue } from '@features/trade/services/proxy-fee-service/models/fee-value';

export type CrossChainFeeType =
  | 'nativeStableSwap'
  | 'sameNativeSwap'
  | 'stableSwap'
  | 'stableTokenSwap'
  | 'stableWnativeSwap'
  | 'tokenSwap'
  | 'sameTokenSwap'
  | 'bridgedNative_StableSwap'
  | 'bridgedNative_TokenSwap'
  | 'bridgedNative_NativeSwap';

export type CrossChainTokenType = `${TokenType}_${TokenType}`;

export type CrossChainTierFeeType =
  `${CrossChainFeeType}_${BlockchainStatus['tier']}_${BlockchainStatus['tier']}`;

export type CrossChainTierFee = Record<CrossChainTierFeeType, FeeValue>;
