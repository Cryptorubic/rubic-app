import { AirdropNode } from '@features/swap-and-earn/models/airdrop-node';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import BigNumber from 'bignumber.js';
import BalanceTree from '@features/swap-and-earn/utils/balance-tree';
import { firstValueFrom, Observable } from 'rxjs';
import { MerkleTree } from '@features/swap-and-earn/models/merkle-tree';

interface SourceNode {
  index: number;
  balance: string;
}

export abstract class SwapAndEarnMerkleService {
  protected abstract fetchMerkleTree(): Observable<MerkleTree>;

  public async getMerkleTree(): Promise<MerkleTree> {
    return firstValueFrom(this.fetchMerkleTree());
  }

  private async getMerkleTreeSource(): Promise<{ [Key: string]: SourceNode }> {
    const merkleTree = await this.getMerkleTree();

    return Object.entries(merkleTree.claims).reduce((acc, node) => {
      return {
        ...acc,
        [node[0].toLowerCase()]: {
          index: node[1].index,
          balance: node[1].amount
        }
      };
    }, {});
  }

  private async getBalanceTree(): Promise<BalanceTree> {
    const merkleTreeSource = await this.getMerkleTreeSource();

    return new BalanceTree(
      Object.entries(merkleTreeSource).map(([address, { balance }]) => ({
        account: address,
        amount: EthersBigNumber.from(balance)
      }))
    );
  }

  public async getProofByAddress(address: string): Promise<string[] | null> {
    if (!address) {
      return null;
    }

    const desiredNode = await this.getNodeByAddress(address);
    if (!desiredNode) {
      return null;
    }

    const balanceTree = await this.getBalanceTree();

    return balanceTree.getProof(desiredNode.index, address, desiredNode.amount);
  }

  public async getNodeByAddress(address: string | null): Promise<AirdropNode | null> {
    if (!address) {
      return null;
    }

    const merkleTreeSource = await this.getMerkleTreeSource();
    const node = merkleTreeSource[address.toLowerCase()];
    if (!node) {
      return null;
    }

    return {
      index: node.index,
      account: address,
      amount: EthersBigNumber.from(node.balance)
    };
  }

  public async getAmountByAddress(address: string | null): Promise<BigNumber> {
    const node = await this.getNodeByAddress(address);
    return node ? new BigNumber(node.amount.toString()) : new BigNumber(0);
  }
}
