import { FeaturesWallet } from '@core/services/wallets/wallets-adapters/standard-adapter/models/features-wallet';
import { StandardFeatures } from '@core/services/wallets/wallets-adapters/standard-adapter/models/standard-features';
import { Wallet } from '@wallet-standard/base';
import { StandardConnectOutput } from '@wallet-standard/features';

export abstract class StandardAdapter<SpecificFeatures extends Wallet['features']> {
  protected wallet: FeaturesWallet<SpecificFeatures>;

  private _isConnected = false;

  private listeners: Record<string, (() => void)[]> = {};

  protected constructor(wallet: FeaturesWallet<StandardFeatures & SpecificFeatures>) {
    this.wallet = wallet;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  private _accounts: string[] = [];

  public get accounts(): string[] {
    return this._accounts;
  }

  public async connect(): Promise<boolean> {
    try {
      const { accounts } = await this.useConnectFeature();
      this._isConnected = true;
      this.listeners['connect']?.forEach(cb => cb());
      const firstAccount = accounts[0];
      const { address } = firstAccount;
      this._accounts = [address];
      return true;
    } catch {
      this._accounts = [];
      return false;
    }
  }

  public async disconnect(): Promise<boolean> {
    try {
      await this.useDisconnectFeature();
      this._isConnected = false;
      this.listeners['disconnect']?.forEach(cb => cb());
      this._accounts = [];
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

  protected async useConnectFeature(): Promise<StandardConnectOutput> {
    return this.wallet.features['standard:connect']?.connect();
  }

  protected async useDisconnectFeature(): Promise<void> {
    await this.wallet.features['standard:disconnect']?.disconnect?.();
  }
}
