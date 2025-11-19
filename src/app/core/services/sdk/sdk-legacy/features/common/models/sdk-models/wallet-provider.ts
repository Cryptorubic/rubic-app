import { WalletAdapter } from '@suiet/wallet-sdk';
import { TonConnectUI } from '@tonconnect/ui';
import { TronWeb } from 'tronweb';
import { WalletClient } from 'viem';
import { CHAIN_TYPE } from '@cryptorubic/core';
import { BtcWallet } from '@app/core/services/wallets/wallets-adapters/solana/models/btc-wallet';
import { SolanaWallet } from '@app/core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

export interface WalletProviderCore<T = RubicAny> {
  /**
   * Core provider.
   */
  readonly core: T;

  /**
   * User wallet address.
   */
  readonly address: string;
}

export type EvmWalletProviderCore = WalletProviderCore<WalletClient>;
export type TronWalletProviderCore = WalletProviderCore<TronWeb>;
export type SolanaWalletProviderCore = WalletProviderCore<SolanaWallet>;
export type TonWalletProviderCore = WalletProviderCore<TonConnectUI>;
export type BitcoinWalletProviderCore = WalletProviderCore<BtcWallet>;
export type SuiWalletProviderCore = WalletProviderCore<WalletAdapter>;

/**
 * Stores wallet core and information about current user, used to make `send` transactions.
 */
interface IWalletProvider {
  readonly [CHAIN_TYPE.EVM]?: EvmWalletProviderCore;
  readonly [CHAIN_TYPE.TRON]?: TronWalletProviderCore;
  readonly [CHAIN_TYPE.SOLANA]?: SolanaWalletProviderCore;
  readonly [CHAIN_TYPE.TON]?: TonWalletProviderCore;
  readonly [CHAIN_TYPE.BITCOIN]?: BitcoinWalletProviderCore;
  readonly [CHAIN_TYPE.SUI]?: SuiWalletProviderCore;
}

export type WalletProvider = Partial<IWalletProvider>;
