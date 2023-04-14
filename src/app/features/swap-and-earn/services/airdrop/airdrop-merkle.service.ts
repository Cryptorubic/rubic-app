import { Injectable } from '@angular/core';
import { tuiPure } from '@taiga-ui/cdk';
import { AirdropNode } from '@features/swap-and-earn/models/airdrop-node';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import BigNumber from 'bignumber.js';
import sourceAirdropMerkle from '@features/swap-and-earn/constants/airdrop/airdrop-merkle-tree.json';
import BalanceTree from '@features/swap-and-earn/utils/balance-tree';

interface SourceNode {
  index: number;
  balance: string;
}

@Injectable()
export class AirdropMerkleService {
  private readonly claims: {
    [Key: string]: {
      index: number;
      amount: string;
      proof: string[];
    };
  } = sourceAirdropMerkle.claims;

  private readonly correctMerkleTreeSource = Object.keys(this.claims).map(item => {
    return {
      [item]: {
        index: this.claims[item].index,
        balance: this.claims[item].amount
      }
    };
  });

  private readonly xxx = this.correctMerkleTreeSource.map(node => {
    return [
      Object.keys(node)[0].toLowerCase(),
      { index: node[Object.keys(node)[0]].index, balance: node[Object.keys(node)[0]].balance }
    ];
  });

  private readonly merkleTreeSource: { [Key: string]: SourceNode } = Object.fromEntries(this.xxx);

  private readonly merkleTree = new BalanceTree(
    Object.entries(this.merkleTreeSource).map(([address, { balance }]) => ({
      account: address,
      amount: EthersBigNumber.from(balance)
    }))
  );

  constructor() {}

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
