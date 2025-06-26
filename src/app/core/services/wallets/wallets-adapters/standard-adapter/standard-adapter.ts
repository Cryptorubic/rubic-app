import { FeaturesWallet } from '@core/services/wallets/wallets-adapters/standard-adapter/models/features-wallet';
import { StandardFeatures } from '@core/services/wallets/wallets-adapters/standard-adapter/models/standard-features';
import { Wallet } from '@wallet-standard/base/src/wallet';

export abstract class StandardAdapter<SpecificFeatures extends Wallet['features']> {
  protected wallet: FeaturesWallet<SpecificFeatures>;

  private _isConnected = false;

  private listeners: Record<string, (() => void)[]> = {};

  protected constructor(wallet: FeaturesWallet<StandardFeatures & SpecificFeatures>) {
    this.wallet = wallet;
  }

  public get publicKey(): { toBytes: () => Uint8Array; toString: () => string } | undefined {
    const account = this.wallet.accounts[0];
    return account?.publicKey
      ? { toBytes: () => account.publicKey as Uint8Array, toString: () => account.address }
      : undefined;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public async connect(): Promise<boolean> {
    try {
      await this.wallet.features['standard:connect']?.connect();
      this._isConnected = true;
      this.listeners['connect']?.forEach(cb => cb());
      return true;
    } catch {
      return false;
    }
  }

  public async disconnect(): Promise<boolean> {
    try {
      await this.wallet.features['standard:disconnect']?.disconnect?.();
      this._isConnected = false;
      this.listeners['disconnect']?.forEach(cb => cb());
      return true;
    } catch {
      return false;
    }
  }

  public on(event: string, callback: () => void): void {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: () => void): void {
    this.listeners[event] = this.listeners[event]?.filter(cb => cb !== callback) || [];
  }
}
