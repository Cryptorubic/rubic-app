import { tuiPure } from '@taiga-ui/cdk';
import { AirdropNode } from '@features/swap-and-earn/models/airdrop-node';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import BigNumber from 'bignumber.js';
import BalanceTree from '@features/swap-and-earn/utils/balance-tree';

interface SourceNode {
  index: number;
  balance: string;
}

export abstract class SwapAndEarnMerkleService {
  protected readonly merkleTreeSource: { [Key: string]: SourceNode };

  protected readonly merkleTree: BalanceTree;

  @tuiPure
  public getProofByAddress(address: string): string[] | null {
    if (!address) {
      return null;
    }

    const desiredNode = this.getNodeByAddress(address);
    if (!desiredNode) {
      return null;
    }

    return this.merkleTree.getProof(desiredNode.index, address, desiredNode.amount);
  }

  @tuiPure
  public getNodeByAddress(address: string | null): AirdropNode | null {
    if (!address) {
      return null;
    }

    const node = this.merkleTreeSource[address.toLowerCase()];
    if (!node) {
      return null;
    }

    return {
      index: node.index,
      account: address,
      amount: EthersBigNumber.from(node.balance)
    };
  }

  @tuiPure
  public getAmountByAddress(address: string | null): BigNumber {
    const node = this.getNodeByAddress(address);
    return node ? new BigNumber(node.amount.toString()) : new BigNumber(0);
  }
}
