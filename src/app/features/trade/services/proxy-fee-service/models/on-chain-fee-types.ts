import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
import { TokenType } from '@features/trade/services/proxy-fee-service/models/token-type';
import { FeeValue } from '@features/trade/services/proxy-fee-service/models/fee-value';

export type OnChainTypes =
  | 'nativeStableSwap'
  | 'stableSwap'
  | 'stableTokenSwap'
  | 'stableWnativeSwap'
  | 'tokenSwap';

type OnChainTokenType = Exclude<TokenType, 'native_eth'>;

export type OnChainTokenTypes = Exclude<`${OnChainTokenType}_${OnChainTokenType}`, 'native_native'>;

export type OnChainTierFeeType = `${OnChainTypes}_${BlockchainStatus['tier']}`;

export type OnChainTierFee = Record<OnChainTierFeeType, FeeValue>;
