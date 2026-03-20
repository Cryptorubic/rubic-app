import {
  getInputUtxoAndBalance,
  Hinkal,
  prepareHinkalWithSignature,
  RelayerTransaction
} from '@hinkal/common';
import { set, get } from 'idb-keyval';
import { BehaviorSubject } from 'rxjs';
import { HinkalPrivateBalance } from '../../../models/hinkal-private-balances';
import { BlockchainsInfo, EvmBlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { Mutex } from 'async-mutex';
import { PureTokenAmount } from './models/worker-params';
import { HinkalUtils } from '../utils/hinkal-utils';

export class HinkalWorkerLogic {
  private readonly _currSignature$ = new BehaviorSubject<string | null>(null);

  public get currSignature(): string {
    return this._currSignature$.value;
  }

  private readonly mutex = new Mutex();

  private readonly hinkal: Hinkal<unknown>;

  constructor() {
    this.hinkal = new Hinkal({
      generateProofRemotely: true,
      disableCaching: true
    });
  }

  public async updateInstance(address: string, chainId: number, signature: string): Promise<void> {
    return this.mutex.runExclusive(async () => {
      try {
        await prepareHinkalWithSignature(this.hinkal, address, chainId, signature);
        this._currSignature$.next(signature);
      } catch (err) {
        console.error('FAILED TO UPDATE WORKER SIGNATURE', err);
      }
    });
  }

  public async refreshStoredSnapshot(): Promise<void> {
    return this.mutex.runExclusive(async () => {
      try {
        await this.hinkal.resetMerkleTreesIfNecessary();
        await this.hinkal.getEventsFromHinkal();
        await this.saveSnapshot(this.hinkal.getCurrentChainId());
      } catch {}
    });
  }

  public async switchSnapshot(chainId: number): Promise<void> {
    return this.mutex.runExclusive(async () => {
      //await HinkalUtils.updateSnapshot(this.hinkal, chainId);
      await this.hinkal.resetMerkleTreesIfNecessary();
      await this.saveSnapshot(chainId);
    });
  }

  public async switchNetwork(chainId: number, address: string): Promise<void> {
    return this.mutex.runExclusive(async () => {
      if (this.hinkal.getProviderAdapter().chainId !== chainId) {
        //this.hinkal.snapshotsClearInterval();
        await prepareHinkalWithSignature(this.hinkal, address, chainId, this.currSignature);
        await this.hinkal.resetMerkleTreesIfNecessary();
        await this.saveSnapshot(chainId);
      }
    });
  }

  public async getBalances(): Promise<HinkalPrivateBalance> {
    return this.mutex.runExclusive(async () => {
      try {
        await this.hinkal.getEventsFromHinkal();
        const ethAddress = await this.hinkal.getEthereumAddress();
        const chainId = this.hinkal.getCurrentChainId();
        const balances = await this.fetchBalances(chainId, ethAddress);
        const blockchain = BlockchainsInfo.getBlockchainNameById(chainId);
        return {
          [blockchain]: balances
        };
      } catch {
        return {};
      }
    });
  }

  private async fetchBalances(
    chainId: number,
    address: string
  ): Promise<{ tokenAddress: string; amount: string }[]> {
    try {
      const { inputUtxos } = await getInputUtxoAndBalance({
        hinkal: this.hinkal,
        chainId,
        ethAddress: address,
        resetCacheBefore: true,
        allowRemoteDecryption: true
      });

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
      return [];
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

  public async withdraw(
    token: PureTokenAmount<EvmBlockchainName>,
    receiver?: string
  ): Promise<string | null> {
    try {
      // await this.refreshAndUpdateSnapshot(blockchainId[token.blockchain]);

      const hinkalInstance = this.hinkal;
      const withdrawToken = HinkalUtils.convertRubicTokenToHinkalToken(token);
      const receiverAddress = receiver || (await hinkalInstance.getEthereumAddress());

      const resp = (await hinkalInstance.withdraw(
        [withdrawToken],
        [-BigInt(token.stringWeiAmount)],
        receiverAddress,
        false,
        undefined,
        undefined,
        undefined,
        false
      )) as RelayerTransaction;

      //hinkalInstance.snapshotsClearInterval();
      console.log(resp);
      return resp.transactionHash;
    } catch (err) {
      console.log(err);
      //this.errorService.catch(err);
      return null;
    }
  }
}
