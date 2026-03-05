import { EventEmitter } from '@angular/core';
import {
  Connection,
  Transaction,
  TransactionSignature,
  VersionedTransaction
} from '@solana/web3.js';

interface SolanaWalletEvents {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
}

export interface SolanaWallet extends EventEmitter<SolanaWalletEvents> {
  publicKey?: { toBytes(): Uint8Array };
  isConnected: boolean;
  isXDEFI?: boolean;
  signTransaction(transaction: VersionedTransaction): Promise<VersionedTransaction>;
  signAllTransactions(transactions: VersionedTransaction[]): Promise<VersionedTransaction[]>;
  signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
  sendTransaction(
    transaction: Transaction,
    connection?: Connection,
    options?: {}
  ): Promise<TransactionSignature>;
  request<T>(args: { method: string; params: { message: string } }): Promise<T>;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  signAndSendTransaction(transaction: Transaction): Promise<{ signature: string }>;
  on: (event: string, callback: (...args: unknown[]) => void) => unknown;
  off: (event: string, callback: () => void) => unknown;
}

export interface PhantomWallet extends SolanaWallet {
  isPhantom?: boolean;
  _handleDisconnect(...args: unknown[]): unknown;
}

export interface SolflareWallet extends SolanaWallet {
  isSolflare?: boolean;
}

declare global {
  interface Window {
    solana?: PhantomWallet;
    solflare?: SolflareWallet;
  }
}
