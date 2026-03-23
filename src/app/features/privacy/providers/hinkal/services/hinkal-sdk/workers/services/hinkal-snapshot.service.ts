import {
  Hinkal,
  MERKLE_LEVELS,
  MerkleTree,
  poseidonFunction,
  prepareHinkalWithSignature
} from '@hinkal/common';
import { BehaviorSubject } from 'rxjs';
import { get, set } from 'idb-keyval';
import { StoredSnapshot } from '../models/stored-snapshot';

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
      this._currSignature$.next(signature);
    } catch (err) {
      console.error('FAILED TO UPDATE WORKER SIGNATURE', err);
    }
  }

  public async switchSnapshot(chainId: number): Promise<void> {
    //await this.updateSnapshot(this.hinkal, chainId);
    await this.hinkal.resetMerkleTreesIfNecessary();
    //await this.hinkal.getEventsFromHinkal();
    await this.saveSnapshot(chainId);
  }

  public async switchNetwork(chainId: number, address: string): Promise<void> {
    if (this.hinkal.getProviderAdapter().chainId !== chainId) {
      await prepareHinkalWithSignature(this.hinkal, address, chainId, this.currSignature);
      await this.switchSnapshot(chainId);
    }
  }

  private async saveSnapshot(chainId: number): Promise<void> {
    try {
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
    } catch (err) {
      console.log('FAILED TO SAVE SNAPSHOT', err);
    }
  }

  private async updateSnapshot(hinkal: Hinkal<unknown>, chainId: number): Promise<void> {
    const hinkalSnapshot = (await get('hinkalSnapshot')) || {};
    const cachedShapshot = hinkalSnapshot[chainId];

    if (cachedShapshot) {
      const parsedMerkle = JSON.parse(cachedShapshot) as StoredSnapshot;

      const treeMap = this.restoreMerkle(parsedMerkle.merkleTree.tree);
      const treeMapAccessToken = this.restoreMerkle(parsedMerkle.merkleTreeAccessToken.tree);
      const reverseTreeMap = parsedMerkle.merkleTree.reverseTree
        ? this.restoreMerkle(parsedMerkle.merkleTree.reverseTree)
        : undefined;
      const reverseTreeMapAccessToken = parsedMerkle.merkleTreeAccessToken.reverseTree
        ? this.restoreMerkle(parsedMerkle.merkleTreeAccessToken.reverseTree)
        : undefined;

      hinkal.merkleTreeHinkal = MerkleTree.createWithData(
        treeMap,
        reverseTreeMap,
        BigInt(parsedMerkle.merkleTree.index),
        BigInt(parsedMerkle.merkleTree.count),
        poseidonFunction,
        MERKLE_LEVELS,
        0n
      );

      hinkal.merkleTreeAccessToken = MerkleTree.createWithData(
        treeMapAccessToken,
        reverseTreeMapAccessToken,
        BigInt(parsedMerkle.merkleTreeAccessToken.index),
        BigInt(parsedMerkle.merkleTreeAccessToken.count),
        poseidonFunction,
        MERKLE_LEVELS,
        0n
      );

      hinkal.approvals = new Map(
        Object.entries(parsedMerkle.approvals).map(([token, approval]) => {
          const parsedApproval = approval.map(v => ({
            tokenAddress: v.tokenAddress,
            amount: BigInt(v.amount),
            inHinkalAddress: BigInt(v.inHinkalAddress)
          }));
          return [token, parsedApproval];
        })
      );
      hinkal.nullifiers = new Set(parsedMerkle.nullifiers);
      hinkal.encryptedOutputs = parsedMerkle.encryptedOutputs;
    }

    await hinkal.getEventsFromHinkal();
  }

  private restoreMerkle(tree: object): Map<bigint, bigint> {
    const treeMap = new Map();
    Object.entries(tree).forEach(([k, v]) => {
      treeMap.set(BigInt(k), BigInt(v));
    });

    return treeMap;
  }
}
