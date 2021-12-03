import { EventEmitter } from '@angular/core';
import { Connection, Transaction, TransactionSignature } from '@solana/web3.js';

interface SolanaWalletEvents {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
}

export interface SolanaWallet extends EventEmitter<SolanaWalletEvents> {
  publicKey?: { toBytes(): Uint8Array };
  isConnected: boolean;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signMessage(...args: unknown[]): Promise<{ signature: Uint8Array }>;
  sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options: {}
  ): Promise<TransactionSignature>;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  on: (event: string, callback: () => void) => unknown;
  off: (event: string, callback: () => void) => unknown;
}

export interface PhantomWallet extends SolanaWallet {
  isPhantom?: boolean;
  _handleDisconnect(...args: unknown[]): unknown;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

export interface SolflareWallet extends SolanaWallet {
  isSolflare?: boolean;
  signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
}

declare global {
  interface Window {
    solana?: PhantomWallet;
    solflare?: SolflareWallet;
  }
}
