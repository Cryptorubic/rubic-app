import { Hinkal, prepareHinkalWithSignature } from '@hinkal/common';
import { set, get } from 'idb-keyval';
import { BehaviorSubject } from 'rxjs';
import { HinkalPrivateBalance } from '../../../models/hinkal-private-balances';
import { BlockchainsInfo } from '@cryptorubic/core';

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

  public async refreshStoredSnapshot(): Promise<void> {
    await this.hinkal.resetMerkleTreesIfNecessary();
    await this.saveSnapshot(this.hinkal.getCurrentChainId());
  }

  public async switchSnapshot(chainId: number): Promise<void> {
    //await HinkalUtils.updateSnapshot(this.hinkal, chainId);
    await this.hinkal.resetMerkleTreesIfNecessary();
    await this.saveSnapshot(chainId);
  }

  public async switchNetwork(chainId: number, address: string): Promise<void> {
    if (this.hinkal.getProviderAdapter().chainId !== chainId) {
      await this.updateInstance(address, chainId);
      await this.switchSnapshot(chainId);
    }
  }

  public async getBalances(): Promise<HinkalPrivateBalance> {
    await this.hinkal.getEventsFromHinkal();
    const ethAddress = await this.hinkal.getEthereumAddress();
    const chainId = this.hinkal.getCurrentChainId();
    const balances = await this.fetchBalances(chainId, ethAddress);
    const blockchain = BlockchainsInfo.getBlockchainNameById(chainId);
    return {
      [blockchain]: balances
    };
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
