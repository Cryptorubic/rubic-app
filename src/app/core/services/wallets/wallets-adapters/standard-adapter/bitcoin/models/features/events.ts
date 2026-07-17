import type { Wallet } from '@wallet-standard/base';

export const BitcoinEvents = 'bitcoin:events';

export type BitcoinEventsFeature = {
  readonly [BitcoinEvents]: {
    readonly version: BitcoinEventsVersion;
    readonly on: BitcoinEventsOnMethod;
  };
};

export type BitcoinEventsVersion = '1.0.0';

export type BitcoinEventsOnMethod = <E extends BitcoinEventsNames>(
  event: E,
  listener: BitcoinEventsListeners[E]
) => () => void;

export interface BitcoinEventsListeners {
  change(properties: StandardEventsChangeProperties): void;
}

export type BitcoinEventsNames = keyof BitcoinEventsListeners;

export interface StandardEventsChangeProperties {
  readonly chains?: Wallet['chains'];
  readonly features?: Wallet['features'];
  readonly accounts?: Wallet['accounts'];
}
