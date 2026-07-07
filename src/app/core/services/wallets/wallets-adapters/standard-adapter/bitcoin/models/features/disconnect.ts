export const BitcoinDisconnect = 'bitcoin:disconnect';

export type BitcoinDisconnectFeature = {
  readonly [BitcoinDisconnect]: {
    readonly version: BitcoinDisconnectVersion;
    readonly disconnect: BitcoinDisconnectMethod;
  };
};

export type BitcoinDisconnectVersion = '1.0.0';

export type BitcoinDisconnectMethod = () => Promise<void>;
