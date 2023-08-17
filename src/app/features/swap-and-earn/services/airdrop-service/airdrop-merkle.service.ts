import { Injectable } from '@angular/core';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import sourceAirdropMerkle from '@features/swap-and-earn/constants/airdrop/airdrop-merkle-tree.json';
import BalanceTree from '@features/swap-and-earn/utils/balance-tree';
import { SwapAndEarnMerkleService } from '@features/swap-and-earn/services/swap-and-earn-merkle.service';

interface SourceNode {
  index: number;
  balance: string;
}

@Injectable()
export class AirdropMerkleService extends SwapAndEarnMerkleService {
  protected readonly merkleTreeSource: { [Key: string]: SourceNode } = Object.entries(
    sourceAirdropMerkle.claims
  ).reduce((acc, node) => {
    return {
      ...acc,
      [node[0].toLowerCase()]: {
        index: node[1].index,
        balance: node[1].amount
      }
    };
  }, {});

  protected readonly merkleTree = new BalanceTree(
    Object.entries(this.merkleTreeSource).map(([address, { balance }]) => ({
      account: address,
      amount: EthersBigNumber.from(balance)
    }))
  );
}
