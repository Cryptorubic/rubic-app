import { Hinkal, networkRegistry, prepareHinkalWithSignature } from '@hinkal/common';

export class HinkalWorkerSnapshotService {
  private _currSignature: string | null = null;

  private readonly hinkal: Hinkal<unknown>;

  constructor(hinkal: Hinkal<unknown>) {
    this.hinkal = hinkal;
  }

  public async updateInstance(address: string, chainId: number, signature: string): Promise<void> {
    try {
      await prepareHinkalWithSignature(this.hinkal, address, signature);
      await this.hinkal.switchNetwork(networkRegistry[chainId]);
      await this.hinkal.resetMerkle([chainId]);
      this._currSignature = signature;
    } catch (err) {
      console.error('FAILED TO UPDATE WORKER SIGNATURE', err);
    }
  }

  public async switchNetwork(chainId: number, address: string): Promise<void> {
    try {
      if (this.hinkal.getProviderAdapter().getChainId() !== chainId) {
        this.hinkal.snapshotsClearInterval();
        await this.updateInstance(address, chainId, this._currSignature);
      }
    } catch {}
  }

  public async clearSnapshotsInterval(): Promise<void> {
    try {
      this.hinkal.snapshotsClearInterval();
    } catch {}
  }
}
