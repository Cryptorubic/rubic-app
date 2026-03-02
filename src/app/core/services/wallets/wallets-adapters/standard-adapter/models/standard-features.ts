import {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature
} from '@wallet-standard/features';

export type StandardFeatures = StandardConnectFeature &
  StandardDisconnectFeature &
  StandardEventsFeature;
