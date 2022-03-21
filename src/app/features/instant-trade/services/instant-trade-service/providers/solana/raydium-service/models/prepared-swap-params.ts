import { Account, PublicKey, Transaction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export interface PreparedSwapParams {
  owner: PublicKey;
  transaction: Transaction;
  signers: Account[];
  amountIn: BigNumber;
  amountOut: BigNumber;
  mintAccountsAddresses: { [p: string]: string };
}
