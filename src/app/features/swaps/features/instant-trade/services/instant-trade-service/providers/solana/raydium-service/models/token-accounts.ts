import { PublicKey } from '@solana/web3.js';

export type TokenAccounts = {
  from: {
    key: PublicKey;
    isWeth: boolean;
  };
  to: {
    key: PublicKey;
    isWeth: boolean;
  };
};
