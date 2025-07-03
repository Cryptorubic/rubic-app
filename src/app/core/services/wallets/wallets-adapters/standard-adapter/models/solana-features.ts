import {
  SolanaSignAndSendAllTransactionsFeature,
  SolanaSignAndSendTransactionFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature
} from '@solana/wallet-standard-features';
import { StandardFeatures } from '@core/services/wallets/wallets-adapters/standard-adapter/models/standard-features';

export type SolanaFeatures = SolanaSignTransactionFeature &
  SolanaSignAndSendTransactionFeature &
  SolanaSignMessageFeature &
  SolanaSignAndSendAllTransactionsFeature;

export type SolanaStandardFeatures = SolanaFeatures & StandardFeatures;
