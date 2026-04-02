import {
  Chain,
  MerkletreeScanUpdateEvent,
  RailgunBalancesEvent
} from '@railgun-community/shared-models';
import {
  setOnBalanceUpdateCallback,
  setOnTXIDMerkletreeScanCallback,
  setOnUTXOMerkletreeScanCallback,
  refreshBalances
} from '@railgun-community/wallet';
import { postWorkerMessage } from '@features/privacy/providers/railgun/services/worker/utils';

export class BalanceControllerService {
  /**
   * Install callbacks right after Engine initialization.
   * Safe to call multiple times (idempotent).
   */
  public installCallbacks(): void {
    setOnUTXOMerkletreeScanCallback((eventData: MerkletreeScanUpdateEvent) => {
      postWorkerMessage({ method: 'utxoScanUpdate', response: eventData });
    });

    setOnTXIDMerkletreeScanCallback((eventData: MerkletreeScanUpdateEvent) => {
      postWorkerMessage({ method: 'txidScanUpdate', response: eventData });
    });

    setOnBalanceUpdateCallback((eventData: RailgunBalancesEvent) => {
      postWorkerMessage({ method: 'balanceUpdate', response: eventData });
    });
  }

  /**
   * Triggers a private balance refresh (scan) for provided wallet IDs on a chain.
   * This is the core "Updating Balances" operation.
   */
  public async refreshBalances(chain: Chain, walletIds: string[]): Promise<void> {
    await refreshBalances(chain, walletIds);
  }
}
