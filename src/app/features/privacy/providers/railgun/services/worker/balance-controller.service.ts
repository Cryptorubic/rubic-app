import {
  Chain,
  MerkletreeScanUpdateEvent,
  RailgunBalancesEvent,
  RailgunWalletBalanceBucket
} from '@railgun-community/shared-models';
import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
  setOnBalanceUpdateCallback,
  setOnTXIDMerkletreeScanCallback,
  setOnUTXOMerkletreeScanCallback,
  refreshBalances
} from '@railgun-community/wallet';
import { postWorkerMessage } from '@features/privacy/providers/railgun/services/worker/utils';

export class BalanceControllerService {
  private readonly destroy$ = new Subject<void>();

  private callbacksInstalled = false;

  private readonly _utxoScan$ = new BehaviorSubject<MerkletreeScanUpdateEvent | null>(null);

  /**
   * Latest UTXO scan progress/status events.
   */
  public readonly utxoScanUpdates$ = this._utxoScan$.pipe(
    filter((v): v is MerkletreeScanUpdateEvent => v != null)
  );

  private readonly _txIdScan$ = new BehaviorSubject<MerkletreeScanUpdateEvent | null>(null);

  /**
   * Latest TXID scan progress/status events.
   */
  public readonly txIdScan$ = this._txIdScan$.pipe(
    filter((v): v is MerkletreeScanUpdateEvent => v != null)
  );

  /**
   * Holds latest balances per bucket (Spendable, ShieldPending, etc.)
   */
  private readonly _balancesByBucket$ = new BehaviorSubject<
    Partial<Record<RailgunWalletBalanceBucket, RailgunBalancesEvent>>
  >({});

  public readonly balancesSnapshot$ = this._balancesByBucket$.asObservable();

  private pollSub?: Subscription;

  /**
   * Install callbacks right after Engine initialization.
   * Safe to call multiple times (idempotent).
   */
  public installCallbacks(): void {
    if (this.callbacksInstalled) return;

    // Will get called throughout a private balance scan.
    setOnUTXOMerkletreeScanCallback((eventData: MerkletreeScanUpdateEvent) => {
      postWorkerMessage({ method: 'utxoScanUpdate', response: eventData.progress });
    });

    // Will get called throughout a private balance scan.
    setOnTXIDMerkletreeScanCallback((eventData: MerkletreeScanUpdateEvent) => {
      postWorkerMessage({ method: 'txidScanUpdate', response: eventData });
    });

    // Will get called at end of scan per txidVersion + balanceBucket.
    setOnBalanceUpdateCallback((eventData: RailgunBalancesEvent) => {
      postWorkerMessage({ method: 'balanceUpdate', response: eventData });
      // const prev = this._balancesByBucket$.value;
      // this._balancesByBucket$.next({
      //   ...prev,
      //   [event.balanceBucket]: event
      // });
    });

    this.callbacksInstalled = true;
  }

  /**
   * Triggers a private balance refresh (scan) for provided wallet IDs on a chain.
   * This is the core "Updating Balances" operation.
   */
  public async refreshBalances(chain: Chain, walletIds: string[]): Promise<void> {
    // refreshBalances triggers scans and then balance callback events.
    await refreshBalances(chain, walletIds);
  }

  /**
   * Optional: start a polling loop (e.g. every 60s) that calls refreshBalances.
   * Mirrors the idea from docs where refreshBalances can run repeatedly.
   */
  public startPolling(params: {
    chain: Chain;
    walletIds: string[];
    intervalMs: number;
    runImmediately?: boolean;
  }): void {
    const { chain, walletIds, intervalMs, runImmediately = true } = params;

    this.stopPolling();

    const source$ = timer(runImmediately ? 0 : intervalMs, intervalMs).pipe(
      takeUntil(this.destroy$)
    );

    this.pollSub = source$.subscribe({
      next: async () => {
        try {
          await this.refreshBalances(chain, walletIds);
        } catch {
          // Intentionally swallow to keep poll alive; UI can observe scan callbacks/errors elsewhere.
        }
      }
    });
  }

  public stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }
}
