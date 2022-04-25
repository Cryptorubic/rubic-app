import { PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export interface PreparedSwapParams {
  owner: PublicKey;
  signers: Signer[];
  amountIn: BigNumber;
  amountOut: BigNumber;
  mintAccountsAddresses: { [p: string]: string };
  setupInstructions: TransactionInstruction[];
  tradeInstructions: TransactionInstruction[];
}
