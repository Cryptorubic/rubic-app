import { BehaviorSubject } from 'rxjs';
import { CommonWalletAdapter } from '../wallets-adapters/common-wallet-adapter';

export class WalletsManager {
  private readonly _activeWallets$ = new BehaviorSubject<CommonWalletAdapter[]>([]);

  public readonly activeWallets$ = this._activeWallets$.asObservable();

  public get activeWallets(): CommonWalletAdapter[] {
    return this._activeWallets$.value;
  }

  public addWallet(walletAdapter: CommonWalletAdapter): void {
    this._activeWallets$.next([...this.activeWallets, walletAdapter]);
  }

  public removeWallet(walletAdapter: CommonWalletAdapter): void {
    const filteredWallets = this.activeWallets.filter(
      wallet => wallet.walletName !== walletAdapter.walletName
    );
    this._activeWallets$.next(filteredWallets);
  }
}
