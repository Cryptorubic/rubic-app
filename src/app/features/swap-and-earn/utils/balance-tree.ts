import MerkleTree from 'src/app/features/swap-and-earn/utils/merkle-tree';
import { BigNumber, utils } from 'ethers';

export default class BalanceTree {
  private readonly tree = new MerkleTree(
    this.balances.map(({ account, amount }, index) => {
      return BalanceTree.toNode(index, account, amount);
    })
  );

  constructor(private readonly balances: { account: string; amount: BigNumber }[]) {}

  public static toNode(index: number | BigNumber, account: string, amount: BigNumber): Buffer {
    return Buffer.from(
      utils
        .solidityKeccak256(['uint256', 'address', 'uint256'], [index, account, amount])
        .substr(2),
      'hex'
    );
  }

  public getProof(index: number | BigNumber, account: string, amount: BigNumber): string[] {
    return this.tree.getHexProof(BalanceTree.toNode(index, account, amount));
  }
}
