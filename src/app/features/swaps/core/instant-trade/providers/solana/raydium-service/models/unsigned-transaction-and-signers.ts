import { Signer, Transaction } from '@solana/web3.js';

export interface UnsignedTransactionAndSigners {
  signers: Signer[];
  transaction: Transaction;
}
