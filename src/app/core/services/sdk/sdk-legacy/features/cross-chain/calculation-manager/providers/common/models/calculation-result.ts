import {
  BitcoinPsbtEncodedConfig,
  BitcoinTransferEncodedConfig,
  EvmTransactionConfig,
  RubicSdkError,
  TonEncodedConfig,
  TronTransactionConfig
} from '@cryptorubic/web3';
import { CrossChainTradeType } from '../../../models/cross-chain-trade-type';
import { CrossChainTrade } from '../cross-chain-trade';

export type CalculationResult<
  T =
    | EvmTransactionConfig
    | null
    | TronTransactionConfig
    | { data: string }
    | TonEncodedConfig
    | BitcoinTransferEncodedConfig
    | BitcoinPsbtEncodedConfig
> =
  | { trade: CrossChainTrade<T>; error?: RubicSdkError; tradeType: CrossChainTradeType }
  | { trade: null; error: RubicSdkError; tradeType: CrossChainTradeType };
