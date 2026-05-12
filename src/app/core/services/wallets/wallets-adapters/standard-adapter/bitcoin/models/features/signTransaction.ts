import type { IdentifierString, WalletAccount } from '@wallet-standard/base';

export const BitcoinSignTransaction = 'bitcoin:signTransaction';

export type BitcoinSignTransactionFeature = {
  readonly [BitcoinSignTransaction]: {
    readonly version: BitcoinSignTransactionVersion;
    readonly signTransaction: BitcoinSignTransactionMethod;
  };
};

export type BitcoinSignTransactionVersion = '1.0.0';

export type BitcoinSignTransactionMethod = (
  ...inputs: readonly BitcoinSignTransactionInput[]
) => Promise<readonly BitcoinSignTransactionOutput[]>;

export interface BitcoinSignTransactionInput {
  readonly psbt: Uint8Array;
  readonly inputsToSign: InputToSign[];
  readonly chain?: IdentifierString;
}

export interface InputToSign {
  readonly account: WalletAccount;
  readonly signingIndexes: number[];
  readonly sigHash?: BitcoinSigHashFlag;
}

export interface BitcoinSignTransactionOutput {
  readonly signedPsbt: Uint8Array;
}

export type BitcoinSigHashFlag =
  | 'ALL'
  | 'NONE'
  | 'SINGLE'
  | 'ALL|ANYONECANPAY'
  | 'NONE|ANYONECANPAY'
  | 'SINGLE|ANYONECANPAY';
