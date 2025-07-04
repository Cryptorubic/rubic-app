import { StandardConnectFeature, StandardDisconnectFeature } from '@wallet-standard/features';
import { StandardEventsFeature } from '@wallet-standard/features/src/events';

export type StandardFeatures = StandardConnectFeature &
  StandardDisconnectFeature &
  StandardEventsFeature;
