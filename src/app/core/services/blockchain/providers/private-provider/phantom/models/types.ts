import { EventEmitter } from '@angular/core';
import { Transaction } from '@solana/web3.js';

export interface PhantomWalletEvents {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
}

export interface PhantomWallet extends EventEmitter<PhantomWalletEvents> {
  isPhantom?: boolean;
  publicKey?: { toBytes(): Uint8Array };
  isConnected: boolean;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  _handleDisconnect(...args: unknown[]): unknown;
  on: (event: string, callback: () => void) => unknown;
  off: (event: string, callback: () => void) => unknown;
}

export interface PhantomWalletAdapterConfig {
  pollInterval?: number;
  pollCount?: number;
}
