import { StandardConnectOutput } from '@wallet-standard/features';

export const BitcoinConnect = 'bitcoin:connect';

export type BitcoinConnectFeature = {
  readonly [BitcoinConnect]: {
    readonly version: BitcoinConnectVersion;
    readonly connect: BitcoinConnectMethod;
  };
};

export type BitcoinConnectVersion = '1.0.0';

export type BitcoinConnectMethod = (input: BitcoinConnectInput) => Promise<BitcoinConnectOutput>;

export interface BitcoinConnectInput {
  readonly purposes: BitcoinAddressPurpose[];
}

export type BitcoinAddressPurpose = 'ordinals' | 'payment';

export type BitcoinConnectOutput = StandardConnectOutput;
