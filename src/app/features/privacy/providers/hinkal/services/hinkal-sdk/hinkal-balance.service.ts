import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Subscription, switchMap, tap, timer, withLatestFrom } from 'rxjs';
import { HinkalPrivateBalance } from '../../models/hinkal-private-balances';
import { HinkalWorkerService } from './hinkal-worker.service';

@Injectable()
export class HinkalBalanceService {
  constructor(private readonly workerService: HinkalWorkerService) {}

  private isPollingActive$ = new BehaviorSubject<boolean>(false);

  private readonly _balances$ = new BehaviorSubject<HinkalPrivateBalance>({});

  public stopPolling(): void {
    this.isPollingActive$.next(false);
  }

  public startPolling(): void {
    this.isPollingActive$.next(true);
  }

  public readonly balances$ = this._balances$.asObservable();

  public initBalancePolling(): Subscription {
    return timer(0, 20000)
      .pipe(
        withLatestFrom(this.isPollingActive$),
        filter(([_, isPollingActive]) => isPollingActive),
        switchMap(() => {
          console.log('FETCH BALANCE');
          return this.workerService.request<void>({
            type: 'updateBalance'
          });
        })
      )
      .subscribe();
  }

  public subscribeOnBalancePolling(): Subscription {
    return this.workerService
      .subscribeOnEvent<HinkalPrivateBalance>({
        type: 'updateBalance'
      })
      .pipe(tap(v => console.log('BALANCE HANDLED', v)))
      .subscribe(balances => {
        this._balances$.next({
          ...this._balances$.value,
          ...balances
        });
      });
  }

  // public async refreshBalances(chains: EvmBlockchainName[]): Promise<void> {
  //   try {
  //     const ethAddress = this.authService.userAddress;

  //     if (!ethAddress) {
  //       this._balances$.next({});
  //       return;
  //     }

  //     const promises = chains.map(chain => {
  //       return this.fetcPrivateBalances(chain, ethAddress);
  //     });

  //     const balances = await Promise.all(promises);

  //     this._balances$.next(Object.fromEntries(chains.map((chain, i) => [chain, balances[i]])));
  //   } catch (err) {
  //     console.error('FAILED TO REFRESH HINKAL BALANCES', err);
  //   }
  // }

  // private async fetcPrivateBalances(
  //   blockchain: EvmBlockchainName,
  //   address: string
  // ): Promise<{ tokenAddress: string; amount: BigNumber }[]> {
  //   try {
  //     const workerParams: WorkerParams = {
  //       chainId: blockchainId[blockchain],
  //       address,
  //       type: 'fetchBalance'
  //     };

  //     const resp = await this.workerService.request<{ tokenAddress: string; amount: BigNumber }[]>(
  //       workerParams
  //     );

  //     return resp;
  //   } catch (err) {
  //     console.error('FAILED TO FETCH HINKAL BALANCE', err);
  //     return [];
  //   }
  // }
}
