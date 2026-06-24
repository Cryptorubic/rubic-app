import { StandardFeatures } from '@core/services/wallets/wallets-adapters/standard-adapter/models/standard-features';
import { BitcoinConnectFeature } from './features/connect';
import { BitcoinDisconnectFeature } from './features/disconnect';
import { BitcoinSignTransactionFeature } from './features/signTransaction';
import { BitcoinSignMessageFeature } from './features/signMessage';
import { BitcoinEventsFeature } from './features/events';

export type BitcoinFeatures = BitcoinConnectFeature &
  BitcoinDisconnectFeature &
  BitcoinSignTransactionFeature &
  BitcoinSignMessageFeature &
  BitcoinEventsFeature;

export type BitcoinStandardFeatures = BitcoinFeatures & StandardFeatures;
