import {
  getInputUtxoAndBalance,
  Hinkal,
  MultiThreadedUtxoUtils,
  prepareHinkalWithSignature,
  Utxo
} from '@hinkal/common';
import BigNumber from 'bignumber.js';
import { set, get } from 'idb-keyval';
import { BehaviorSubject } from 'rxjs';
import { HinkalUtils } from '../utils/hinkal-utils';

export class HinkalWorkerLogic {
  private readonly _currSignature$ = new BehaviorSubject<string | null>(null);

  public get currSignature(): string {
    return this._currSignature$.value;
  }

  private readonly hinkal: Hinkal<unknown>;

  constructor() {
    this.hinkal = new Hinkal({
      generateProofRemotely: true,
      disableCaching: false
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
    await HinkalUtils.updateSnapshot(this.hinkal, chainId);
    await this.hinkal.resetMerkleTreesIfNecessary();
    // await this.hinkal.getEventsFromHinkal();
    await this.saveSnapshot(chainId);
  }

  public async switchNetwork(chainId: number, address: string): Promise<void> {
    if (this.hinkal.getProviderAdapter().chainId !== chainId) {
      await this.updateInstance(address, chainId);
      await this.switchSnapshot(chainId);
    }
  }

  public async fetchBalances(
    chainId: number,
    address: string
  ): Promise<{ tokenAddress: string; amount: string }[]> {
    try {
      if (this.hinkal.getProviderAdapter().chainId !== chainId) {
        await this.updateInstance(address, chainId);
        await this.switchSnapshot(chainId);
      }

      const { inputUtxos } = await getInputUtxoAndBalance({
        hinkal: this.hinkal,
        chainId,
        resetCacheBefore: true,
        allowRemoteDecryption: true,
        ethAddress: address,
        passedShieldedPrivateKey: this.hinkal.userKeys.getShieldedPrivateKey(),
        passedShieldedPublicKey: this.hinkal.userKeys.getShieldedPublicKey()
      }).catch(err => {
        console.log('UTXO FETCH ERR', err);
        return { inputUtxos: [] as Utxo[] };
      });

      console.log(inputUtxos);

      const fetchedBalances = inputUtxos.reduce((acc, val) => {
        const balance = acc[val.erc20TokenAddress.toLowerCase()];
        const currAmount = new BigNumber(val.amount.toString());

        return {
          ...acc,
          [val.erc20TokenAddress.toLowerCase()]: balance ? balance.plus(currAmount) : currAmount
        };
      }, {} as Record<string, BigNumber>);

      return Object.entries(fetchedBalances).map(([token, amount]) => ({
        tokenAddress: token,
        amount: amount.toString()
      }));
    } catch (err) {
      console.log('FETCHED BALANCE ERR', err);
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
        count: jsonMerkleTreeAccessToken.count
      },
      merkleTree: {
        tree: jsonMerkleTree.tree,
        index: jsonMerkleTree.index,
        count: jsonMerkleTree.count
      }
    };

    hinkalSnapshot[chainId] = JSON.stringify(snapshot, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    await set('hinkalSnapshot', hinkalSnapshot);
  }
}
