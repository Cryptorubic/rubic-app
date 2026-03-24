import { Hinkal, prepareHinkalWithSignature } from '@hinkal/common';
import { BehaviorSubject } from 'rxjs';

export class HinkalWorkerSnapshotService {
  private readonly _currSignature$ = new BehaviorSubject<string | null>(null);

  public get currSignature(): string {
    return this._currSignature$.value;
  }

  private readonly hinkal: Hinkal<unknown>;

  constructor(hinkal: Hinkal<unknown>) {
    this.hinkal = hinkal;
  }

  public async updateInstance(address: string, chainId: number, signature: string): Promise<void> {
    try {
      await prepareHinkalWithSignature(this.hinkal, address, chainId, signature);
      await this.hinkal.resetMerkleTreesIfNecessary();
      this._currSignature$.next(signature);
    } catch (err) {
      console.error('FAILED TO UPDATE WORKER SIGNATURE', err);
    }
  }

  public async switchNetwork(chainId: number, address: string): Promise<void> {
    if (this.hinkal.getProviderAdapter().chainId !== chainId) {
      this.hinkal.snapshotsClearInterval();
      await this.updateInstance(address, chainId, this.currSignature);
    }
  }
}
