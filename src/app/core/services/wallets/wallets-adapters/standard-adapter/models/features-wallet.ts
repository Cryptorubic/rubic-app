import { WalletWithFeatures } from '@wallet-standard/base';
import { StandardFeatures } from '@core/services/wallets/wallets-adapters/standard-adapter/models/standard-features';

export type FeaturesWallet<SpecificFeatures> = WalletWithFeatures<
  SpecificFeatures & StandardFeatures
>;
