import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, map, takeUntil, tap } from 'rxjs';
import { getMinimalTokensByChain } from './utils/get-minimal-tokens-by-chain';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { MinimalTokenWithBalance } from '../../../models/privacycash-tokens-facade-models';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import BigNumber from 'bignumber.js';
import { PrivacycashSignatureService } from '../../privacy-cash-signature.service';
import { PrivacycashInWorkerMsg, PrivacycashOutWorkerMsg } from './worker/models/worker-models';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { compareTokens } from '@app/shared/utils/utils';
import { toPrivacyCashTokenAddr, toRubicTokenAddr } from '../../../utils/converter';

@Injectable()
export class PrivacycashTokensService {
  private readonly privacycashSignatureService = inject(PrivacycashSignatureService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly _updateBalances$ = new BehaviorSubject<boolean>(false);

  public readonly updateBalances$ = this._updateBalances$.asObservable();

  private readonly _tokens$ = new BehaviorSubject<MinimalTokenWithBalance[]>(
    this.initializeTokensList()
  );

  public readonly tokens$ = this._tokens$.asObservable();

  private readonly _utxosLoadingState$ = new BehaviorSubject<{ [tokenAddr: string]: boolean }>({});

  /**
   * Emits true when any token loads private balances
   */
  public readonly loading$ = this._utxosLoadingState$.pipe(
    map(loadingState => Object.values(loadingState).some(loading => loading))
  );

  private setLoadingState(tokenAddr: string, loading: boolean): void {
    this._utxosLoadingState$.next({ ...this._utxosLoadingState$.value, [tokenAddr]: loading });
  }

  private resetLoadingState(): void {
    this._utxosLoadingState$.next({});
  }

  private readonly worker = new Worker(new URL('./worker/privacycash.worker', import.meta.url));

  private sendMsgToWorker(msg: PrivacycashInWorkerMsg): void {
    this.worker.postMessage(msg);
  }

  public workerOutMsg$(destroy$: TuiDestroyService): Observable<{ data: PrivacycashOutWorkerMsg }> {
    return fromEvent<{ data: PrivacycashOutWorkerMsg }>(this.worker, 'message').pipe(
      tap(msg => {
        switch (msg.data.type) {
          case 'init':
            console.debug(`[PrivacycashTokensService_workerOutMsg$] worker initialized`);
            break;
          case 'stop':
            console.debug(`[PrivacycashTokensService_workerOutMsg$] worker stopped`);
            this.resetLoadingState();
            break;
          case 'getBalances':
            const prevTokens = this._tokens$.value;
            const tokensWithBalance = msg.data.tokens;
            const updatedTokens = prevTokens.map(token => {
              const updatedToken = tokensWithBalance.find(balanceToken => {
                const rubicCompatibleToken = {
                  ...balanceToken,
                  address: toRubicTokenAddr(balanceToken.address)
                };
                return compareTokens(token, rubicCompatibleToken);
              });
              return updatedToken
                ? { ...token, balanceWei: new BigNumber(updatedToken.balanceWei) }
                : token;
            });
            this._tokens$.next(updatedTokens);

            tokensWithBalance.forEach(t => this.setLoadingState(t.address, false));
            break;
          case 'localStorageData':
            const localStorageData = msg.data.localStorageData;
            queueMicrotask(() => {
              Object.entries(localStorageData).forEach(([key, value]) =>
                localStorage.setItem(key, value)
              );
            });
            break;
          default:
            console.debug(`[PrivacycashTokensService_workerOutMsg$] unknown msg`, msg.data);
        }
      }),
      takeUntil(destroy$)
    );
  }

  public updatePrivateBalances(): void {
    this._updateBalances$.next(true);
  }

  private initializeTokensList(): MinimalTokenWithBalance[] {
    const pcAllSupportedMinimalTokens: MinimalToken[] = getMinimalTokensByChain('allChains');
    return pcAllSupportedMinimalTokens.map(minimalToken => ({
      ...minimalToken,
      balanceWei: new BigNumber(0)
    }));
  }

  public initWorker(): void {
    this.sendMsgToWorker({
      type: 'init',
      data: {
        localStorageData: Object.fromEntries(Object.entries(localStorage)),
        signature: this.privacycashSignatureService.signature
      }
    });
  }

  public stopWorker(): void {
    this.sendMsgToWorker({ type: 'stop' });
  }

  public async loadBalances(): Promise<void> {
    const pcAllSupportedMinimalTokens: MinimalToken[] = getMinimalTokensByChain('allChains').map(
      token => ({ ...token, address: toPrivacyCashTokenAddr(token.address) })
    );
    pcAllSupportedMinimalTokens.forEach(token => this.setLoadingState(token.address, true));

    this.sendMsgToWorker({
      type: 'getBalances',
      walletAddr: this.walletConnectorService.address,
      tokens: pcAllSupportedMinimalTokens,
      useCache: false
    });
  }
}
