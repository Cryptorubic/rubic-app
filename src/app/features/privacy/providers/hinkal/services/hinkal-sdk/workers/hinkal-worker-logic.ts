import { Hinkal, MultiThreadedUtxoUtils, prepareHinkalWithSignature } from '@hinkal/common';
import { set, get } from 'idb-keyval';
import { BehaviorSubject } from 'rxjs';

export class HinkalWorkerLogic {
  private readonly _currSignature$ = new BehaviorSubject<string | null>(null);

  public get currSignature(): string {
    return this._currSignature$.value;
  }

  private readonly hinkal: Hinkal<unknown>;

  constructor() {
    this.hinkal = new Hinkal({
      generateProofRemotely: true,
      disableCaching: true
    });

    // @TODO remove after nested utxoWorkers cancelation fix
    //@ts-ignore
    (this.hinkal.utxoUtils as MultiThreadedUtxoUtils).NUM_WORKERS = 1;
  }

  public async updateInstance(address: string, chainId: number, signature?: string): Promise<void> {
    try {
      await prepareHinkalWithSignature(
        this.hinkal,
        address,
        chainId,
        signature || this.currSignature
      );
      if (signature) this._currSignature$.next(signature);
    } catch (err) {
      console.error('FAILED TO UPDATE WORKER SIGNATURE', err);
    }
  }

  public async switchSnapshot(chainId: number): Promise<void> {
    //await HinkalUtils.updateSnapshot(this.hinkal, chainId);
    await this.hinkal.resetMerkleTreesIfNecessary();
    // await this.watchBalances();
    await this.saveSnapshot(chainId);
  }

  public async getBalances(): Promise<{ tokenAddress: string; amount: string }[]> {
    await this.hinkal.getEventsFromHinkal();
    const ethAddress = await this.hinkal.getEthereumAddress();
    const resp = await this.fetchBalances(this.hinkal.getCurrentChainId(), ethAddress);

    return resp;
  }

  public async switchNetwork(chainId: number, address: string): Promise<void> {
    if (this.hinkal.getProviderAdapter().chainId !== chainId) {
      await this.updateInstance(address, chainId);
      await this.switchSnapshot(chainId);
    }
  }

  private async fetchBalances(
    chainId: number,
    address: string
  ): Promise<{ tokenAddress: string; amount: string }[]> {
    try {
      const resp = await this.hinkal.getTotalBalance(
        chainId,
        this.hinkal.userKeys,
        address,
        true,
        true
      );

      console.log(resp);
      return resp.map(tokenBalance => ({
        tokenAddress: tokenBalance.token.erc20TokenAddress,
        amount: tokenBalance.balance.toString()
      }));
    } catch (err) {
      console.log('FETCHED BALANCE ERR', err);
      return [];
    }
  }

  private async saveSnapshot(chainId: number): Promise<void> {
    const hinkalSnapshot = (await get('hinkalSnapshot')) || {};
    const jsonMerkleTree = this.hinkal.merkleTreeHinkal.toJSON();
    const jsonMerkleTreeAccessToken = this.hinkal.merkleTreeAccessToken.toJSON();

    const snapshot = {
      approvals: Object.fromEntries(this.hinkal.approvals),
      nullifiers: Array.from(this.hinkal.nullifiers),
      merkleTreeAccessToken: {
        tree: jsonMerkleTreeAccessToken.tree,
        index: jsonMerkleTreeAccessToken.index,
        count: jsonMerkleTreeAccessToken.count,
        ...(jsonMerkleTreeAccessToken.reverseTree && {
          reverseTree: jsonMerkleTreeAccessToken.reverseTree
        })
      },
      merkleTree: {
        tree: jsonMerkleTree.tree,
        index: jsonMerkleTree.index,
        count: jsonMerkleTree.count,
        ...(jsonMerkleTree.reverseTree && { reverseTree: jsonMerkleTree.reverseTree })
      },
      encryptedOutputs: this.hinkal.encryptedOutputs
    };

    hinkalSnapshot[chainId] = JSON.stringify(snapshot, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    await set('hinkalSnapshot', hinkalSnapshot);
  }
}
