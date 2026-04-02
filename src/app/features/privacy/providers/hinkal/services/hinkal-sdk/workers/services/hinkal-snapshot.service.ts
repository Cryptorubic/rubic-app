import { Hinkal, prepareHinkalWithSignature } from '@hinkal/common';

export class HinkalWorkerSnapshotService {
  private _currSignature: string | null = null;

  private readonly hinkal: Hinkal<unknown>;

  constructor(hinkal: Hinkal<unknown>) {
    this.hinkal = hinkal;
  }

  public async updateInstance(address: string, chainId: number, signature: string): Promise<void> {
    try {
      await prepareHinkalWithSignature(this.hinkal, address, chainId, signature);
      await this.hinkal.resetMerkle();
      this._currSignature = signature;
    } catch (err) {
      console.error('FAILED TO UPDATE WORKER SIGNATURE', err);
    }
  }

  public async switchNetwork(chainId: number, address: string): Promise<void> {
    if (this.hinkal.getProviderAdapter().chainId !== chainId) {
      this.hinkal.snapshotsClearInterval();
      await this.updateInstance(address, chainId, this._currSignature);
    }
  }

  public async clearSnapshotsInterval(): Promise<void> {
    try {
      await this.hinkal.getEventsFromHinkal();
      this.hinkal.snapshotsClearInterval();
    } catch {}
  }
}
