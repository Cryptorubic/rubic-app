import { BehaviorSubject, filter, tap } from 'rxjs';
import { CommonWalletAdapter } from '../wallets-adapters/common-wallet-adapter';
import { LastEventInWalletsManager } from '../models/wallets-manager-types';

export class WalletsManager {
  private readonly _activeWallets$ = new BehaviorSubject<CommonWalletAdapter[]>([]);

  public readonly activeWallets$ = this._activeWallets$.asObservable();

  private readonly _lastEvent$ = new BehaviorSubject<LastEventInWalletsManager>(null);

  public readonly lastEvent$ = this._lastEvent$.pipe(
    filter(Boolean),
    tap(lastEVTN => console.log('%cLAST_EVENT', 'color: aqua; font-size: 20px;', lastEVTN))
  );

  public get activeWallets(): CommonWalletAdapter[] {
    return this._activeWallets$.value;
  }

  public addWallet(walletAdapter: CommonWalletAdapter): void {
    this._activeWallets$.next([...this.activeWallets, walletAdapter]);
    this._lastEvent$.next({
      type: 'connected',
      affectedWalletAddress: walletAdapter.address,
      affectedWalletName: walletAdapter.walletName,
      affectedChainType: walletAdapter.chainType
    });
  }

  public removeWallet(walletAdapter: CommonWalletAdapter): void {
    const filteredWallets = this.activeWallets.filter(
      wallet => wallet.walletName !== walletAdapter.walletName
    );
    this._activeWallets$.next(filteredWallets);
    this._lastEvent$.next({
      type: 'disconnected',
      affectedWalletAddress: walletAdapter.address,
      affectedWalletName: walletAdapter.walletName,
      affectedChainType: walletAdapter.chainType
    });
  }
}
