import { inject, Injectable } from '@angular/core';
import { StoreService } from '@core/services/store/store.service';
import { Store } from '@core/services/store/models/store';
import { BehaviorSubject, from, of } from 'rxjs';
import { StepType } from '@features/privacy/providers/railgun/models/step';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { switchTap } from '@shared/utils/utils';
import {
  Chain,
  RailgunBalancesEvent,
  RailgunWalletBalanceBucket,
  RailgunWalletInfo
} from '@railgun-community/shared-models';
import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';
import { RailgunResponse } from '@features/privacy/providers/railgun/services/worker/models';
import BigNumber from 'bignumber.js';

@Injectable()
export class RailgunFacadeService {
  private readonly _railgunInitialised$ = new BehaviorSubject<boolean>(false);

  public readonly railgunInitialised$ = this._railgunInitialised$.asObservable();

  private readonly storeService = inject(StoreService);

  private readonly storageKey: keyof Store = 'RAILGUN_ENCRYPTION_CREDS_V1';

  private readonly _balancesByBucket$ = new BehaviorSubject<
    Partial<Record<RailgunWalletBalanceBucket, RailgunBalancesEvent>>
  >({});

  public readonly balancesSnapshot$ = this._balancesByBucket$.asObservable();

  private readonly _currentStep$ = new BehaviorSubject<StepType>('connectWallet');

  public readonly currentStep$ = this._currentStep$.asObservable();

  private readonly _account$ = new BehaviorSubject<PublicAccount | null>(null);

  public readonly account$ = this._account$.asObservable().pipe(
    switchTap(account => {
      if (account) {
        return from(this.handleAccount(account));
      }
      return of(null);
    })
  );

  private readonly _railgunAccount$ = new BehaviorSubject<RailgunWalletInfo | null>(null);

  public readonly railgunAccount$ = this._railgunAccount$.asObservable();

  private readonly _balances$ = new BehaviorSubject<
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null
  >(null);

  public readonly balances$ = this._balances$.asObservable();

  private readonly _pendingBalances$ = new BehaviorSubject<
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null
  >(null);

  public readonly pendingBalances$ = this._pendingBalances$.asObservable();

  private railgunWorker = new Worker(new URL('./worker/railgun.worker', import.meta.url), {
    type: 'module'
  });

  public unlockFromPassword(_password: string): Promise<string> {
    throw new Error();
    // const storedCreds = this.storeService.getItem(this.storageKey);
    // if (storedCreds) {
    //   return this.railgunAdapter.encryptionService.unlockFromPassword(
    //     password,
    //     storedCreds as string
    //   );
    // }
  }

  public initService(): void {
    this.railgunWorker.postMessage({ method: 'init', params: null });
    this.railgunWorker.onmessage = ({ data }) => {
      if (data === 'initialized') {
        console.log('Railgun service initialized');
        this._railgunInitialised$.next(true);
      }
    };
  }

  private async setupFromPassword(account: string): Promise<string> {
    this.railgunWorker.postMessage({ method: 'setupFromPassword', params: account });
    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({ data }: { data: RailgunResponse<string> }) => {
        if (data.method === 'setupFromPassword') {
          resolve(data.response);
        }
      };
    });
  }

  private createPrivateWallet(
    phrase: string,
    blockchain: PrivacySupportedNetworks,
    encryptionKey: string
  ): Promise<RailgunWalletInfo> {
    this.railgunWorker.postMessage({
      method: 'createPrivateWallet',
      params: { phrase, blockchain, encryptionKey }
    });
    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({ data }: { data: RailgunResponse<RailgunWalletInfo> }) => {
        if (data.method === 'createPrivateWallet') {
          resolve(data.response);
        }
      };
    });
  }

  private async refreshBalances(chain: Chain, walletIds: string[]): Promise<void> {
    this.railgunWorker.postMessage({
      method: 'refreshBalances',
      params: { chain, walletIds }
    });
    this.railgunWorker.onmessage = ({
      data
    }: {
      data: RailgunResponse<RailgunBalancesEvent | string>;
    }) => {
      if (data.method === 'balanceUpdate') {
        const eventData = data.response as RailgunBalancesEvent;
        const prev = this._balancesByBucket$.value;
        this._balancesByBucket$.next({
          ...prev,
          [eventData.balanceBucket]: eventData
        });
      }
      if (data.method === 'utxoScanUpdate') {
        const eventData = data.response as string;
        console.log('Scan progress...: ', eventData);
      }
    };
  }

  private async handleAccount(account: PublicAccount): Promise<void> {
    try {
      const encryptionKeys = await this.setupFromPassword(account.password);
      const walletInfo = await this.createPrivateWallet(
        account.phrase,
        'Polygon' as RubicAny,
        encryptionKeys
      );
      console.log('[RAILGUN] Wallet info: ', walletInfo);
      this._railgunAccount$.next(walletInfo);

      await this.refreshBalances({ type: 0, id: 137 }, [walletInfo.id]);

      this.balancesSnapshot$.subscribe(update => {
        if (update?.Spendable) {
          const blockchain = BlockchainsInfo.getBlockchainNameById(update?.Spendable.chain.id);
          const tokens = update?.Spendable.erc20Amounts
            .filter(el => el.amount !== BigInt(0))
            .map(token => ({
              blockchain,
              address: token.tokenAddress,
              amount: new BigNumber(token.amount.toString()).toFixed()
            }));
          this._balances$.next(tokens);
        } else {
          this._balances$.next([]);
        }
        if (update?.ShieldPending) {
          const blockchain = BlockchainsInfo.getBlockchainNameById(update?.ShieldPending.chain.id);
          const tokens = update?.ShieldPending.erc20Amounts
            .filter(el => el.amount !== BigInt(0))
            .map(token => ({
              blockchain,
              address: token.tokenAddress,
              amount: new BigNumber(token.amount.toString()).toFixed()
            }));
          this._pendingBalances$.next(tokens);
        }
      });
    } catch (error) {
      console.warn(error);
    }
  }

  public setAccount(account: PublicAccount): void {
    this._account$.next(account);
  }
}
