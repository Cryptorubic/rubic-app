import { AirdropNode } from '@features/swap-and-earn/models/airdrop-node';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import BigNumber from 'bignumber.js';
import BalanceTree from '@features/swap-and-earn/utils/balance-tree';
import { MerkleTree } from '@features/swap-and-earn/models/merkle-tree';

interface SourceNode {
  index: number;
  balance: string;
}

export class SwapAndEarnMerkleService {
  private getMerkleTreeSource(merkleTree: MerkleTree): { [Key: string]: SourceNode } {
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

  private getBalanceTree(merkleTree: MerkleTree): BalanceTree {
    const merkleTreeSource = this.getMerkleTreeSource(merkleTree);

    return new BalanceTree(
      Object.entries(merkleTreeSource).map(([address, { balance }]) => ({
        account: address,
        amount: EthersBigNumber.from(balance)
      }))
    );
  }

  public getProofByAddress(address: string, merkleTree: MerkleTree): string[] | null {
    if (!address) {
      return null;
    }

    const desiredNode = this.getNodeByAddress(address, merkleTree);
    if (!desiredNode) {
      return null;
    }

    const balanceTree = this.getBalanceTree(merkleTree);

    return balanceTree.getProof(desiredNode.index, address, desiredNode.amount);
  }

  public getNodeByAddress(address: string | null, merkleTree: MerkleTree): AirdropNode | null {
    if (!address) {
      return null;
    }

    const merkleTreeSource = this.getMerkleTreeSource(merkleTree);
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

  public getAmountByAddress(address: string | null, merkleTree: MerkleTree): BigNumber {
    const node = this.getNodeByAddress(address, merkleTree);
    return node ? new BigNumber(node.amount.toString()) : new BigNumber(0);
  }
}
