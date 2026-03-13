import { Injectable } from '@angular/core';
import { BehaviorSubject, skip, Subscription, switchMap, tap, timer } from 'rxjs';
import { HinkalPrivateBalance } from '../../models/hinkal-private-balances';
import { BlockchainsInfo } from '@cryptorubic/core';
import { HinkalWorkerService } from './hinkal-worker.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { HinkalInstanceService } from './hinkal-instance.service';

@Injectable()
export class HinkalBalanceService {
  constructor(
    private readonly workerService: HinkalWorkerService,
    private readonly authService: AuthService,
    private readonly hinkalInstance: HinkalInstanceService
  ) {}

  private readonly _balances$ = new BehaviorSubject<HinkalPrivateBalance>({});

  public readonly balances$ = this._balances$.asObservable();

  public initBalancePolling(): Subscription {
    return timer(0, 20000)
      .pipe(
        skip(1),

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
      .subscribeOnEvent({
        type: 'updateBalance'
      })
      .pipe(tap(v => console.log('BALANCE HANDLED', v)))
      .subscribe(balances => {
        this._balances$.next({
          [BlockchainsInfo.getBlockchainNameById(
            this.hinkalInstance.hinkalInstance.getCurrentChainId()
          )]: balances
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
