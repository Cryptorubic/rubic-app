import {
  AccountInfo,
  PublicKey,
  RpcResponseAndContext,
  Signer,
  TransactionInstruction
} from '@solana/web3.js';
import { UnsignedTransactionAndSigners } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/unsigned-transaction-and-signers';

/**
 * Direct request to Solana RPC.
 */
export interface AccountsRpcRequest<T> {
  _rpcRequest: (method: string, params: unknown[]) => Promise<{ error: Error } | { result: T }>;
}

/**
 * Program accounts RPC result.
 */
export interface ProgramAccounts {
  pubkey: PublicKey;
  account: {
    data: string[];
    executable: boolean;
    owner: string;
    lamports: number;
  };
}

/**
 * Base information needed for swap - owner, transaction. signers objects.
 */
export interface BaseInformation {
  owner: PublicKey;
  signers: Signer[];
  setupInstructions: TransactionInstruction[];
  tradeInstructions: TransactionInstruction[];
}

export interface BaseTransaction {
  setupTransaction: UnsignedTransactionAndSigners;
  tradeTransaction: UnsignedTransactionAndSigners;
}

/**
 * RPC response value.
 */
export type ReturnValue = Promise<{
  result: RpcResponseAndContext<
    Array<{
      pubkey: PublicKey;
      account: AccountInfo<{
        parsed: {
          info: {
            tokenAmount: {
              amount: number;
              decimals: number;
            };
            mint: string;
          };
        };
      }>;
    }>
  >;
}>;
