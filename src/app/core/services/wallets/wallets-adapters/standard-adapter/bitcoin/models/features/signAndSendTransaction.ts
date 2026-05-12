import type { IdentifierString } from '@wallet-standard/base';

import type { BitcoinSignTransactionInput } from './signTransaction.js';

export const BitcoinSignAndSendTransaction = 'bitcoin:signAndSendTransaction';

export type BitcoinSignAndSendTransactionFeature = {
  /** Name of the feature. */
  readonly [BitcoinSignAndSendTransaction]: {
    /** Version of the feature implemented by the Wallet. */
    readonly version: BitcoinSignAndSendTransactionVersion;

    /** Method to call to use the feature. */
    readonly signAndSendTransaction: BitcoinSignAndSendTransactionMethod;
  };
};

export type BitcoinSignAndSendTransactionVersion = '1.0.0';

export type BitcoinSignAndSendTransactionMethod = (
  ...inputs: readonly BitcoinSignAndSendTransactionInput[]
) => Promise<readonly BitcoinSignAndSendTransactionOutput[]>;

export interface BitcoinSignAndSendTransactionInput extends BitcoinSignTransactionInput {
  readonly chain: IdentifierString;
}

export interface BitcoinSignAndSendTransactionOutput {
  readonly txId: string;
}
