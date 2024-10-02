import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
import { TokenType } from '@features/trade/services/proxy-fee-service/models/token-type';
import { FeeValue } from '@features/trade/services/proxy-fee-service/models/fee-value';

export type OnChainTypes =
  | 'nativeStableSwap'
  | 'stableSwap'
  | 'stableTokenSwap'
  | 'stableWnativeSwap'
  | 'tokenSwap';

export type OnChainTokenTypes = Exclude<
  `${TokenType}_${TokenType}`,
  'native_native' | 'native_eth_native_eth' | 'native_eth_native' | 'native_native_eth'
>;

export type OnChainTierFeeType = `${OnChainTypes}_${BlockchainStatus['tier']}`;

export type OnChainTierFee = Record<OnChainTierFeeType, FeeValue>;
