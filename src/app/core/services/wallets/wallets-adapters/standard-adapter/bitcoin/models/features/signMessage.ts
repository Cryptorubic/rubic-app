import type { WalletAccount } from '@wallet-standard/base';

export const BitcoinSignMessage = 'bitcoin:signMessage';

export type BitcoinSignMessageFeature = {
  readonly [BitcoinSignMessage]: {
    readonly version: BitcoinSignMessageVersion;
    readonly signMessage: BitcoinSignMessageMethod;
  };
};

export type BitcoinSignMessageVersion = '1.0.0';

export type BitcoinSignMessageMethod = (
  ...inputs: readonly BitcoinSignMessageInput[]
) => Promise<readonly BitcoinSignMessageOutput[]>;

export interface BitcoinSignMessageInput {
  readonly account: WalletAccount;
  readonly message: Uint8Array;
}

export interface BitcoinSignMessageOutput {
  readonly signedMessage: Uint8Array;
  readonly signature: Uint8Array;
}
