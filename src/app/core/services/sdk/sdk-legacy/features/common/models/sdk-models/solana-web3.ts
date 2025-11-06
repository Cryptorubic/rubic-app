import {
  Connection,
  Transaction,
  TransactionSignature,
  VersionedTransaction
} from '@solana/web3.js';

export interface SolanaWeb3 {
  publicKey?: { toBytes(): Uint8Array };
  isConnected: boolean;
  signTransaction(
    transaction: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
  sendTransaction(
    transaction: Transaction | VersionedTransaction,
    connection?: Connection,
    options?: {}
  ): Promise<TransactionSignature>;
  request<T>(args: { method: string; params: { message: string } }): Promise<T>;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  signAndSendTransaction(
    transaction: Transaction | VersionedTransaction
  ): Promise<{ signature: string }>;
  on: (event: string, callback: () => void) => unknown;
  off: (event: string, callback: () => void) => unknown;
}
