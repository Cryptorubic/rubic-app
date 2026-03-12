import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HinkalPrivateBalance } from '../../models/hinkal-private-balances';
import { blockchainId, EvmBlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { HinkalWorkerService } from './hinkal-worker.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { WorkerParams } from './workers/models/worker-params';

@Injectable()
export class HinkalBalanceService {
  constructor(
    private readonly workerService: HinkalWorkerService,
    private readonly authService: AuthService
  ) {}

  private readonly _balances$ = new BehaviorSubject<HinkalPrivateBalance>({});

  public readonly balances$ = this._balances$.asObservable();

  public async refreshBalances(chains: EvmBlockchainName[]): Promise<void> {
    try {
      const ethAddress = this.authService.userAddress;

      if (!ethAddress) {
        this._balances$.next({});
        return;
      }

      const promises = chains.map(chain => {
        return this.fetcPrivateBalances(chain, ethAddress);
      });

      const balances = await Promise.all(promises);

      this._balances$.next(Object.fromEntries(chains.map((chain, i) => [chain, balances[i]])));
    } catch (err) {
      console.error('FAILED TO REFRESH HINKAL BALANCES', err);
    }
  }

  private async fetcPrivateBalances(
    blockchain: EvmBlockchainName,
    address: string
  ): Promise<{ tokenAddress: string; amount: BigNumber }[]> {
    try {
      const workerParams: WorkerParams = {
        chainId: blockchainId[blockchain],
        address,
        type: 'fetchBalance'
      };

      const resp = await this.workerService.request<{ tokenAddress: string; amount: BigNumber }[]>(
        workerParams
      );

      return resp;
    } catch (err) {
      console.error('FAILED TO FETCH HINKAL BALANCE', err);
      return [];
    }
  }
}
