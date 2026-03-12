import { Token } from '@app/shared/models/tokens/token';
import { blockchainId, PriceToken, TokenAmount } from '@cryptorubic/core';
import { ERC20Token, Hinkal, MERKLE_LEVELS, MerkleTree, poseidonFunction } from '@hinkal/common';
import { get } from 'idb-keyval';
export class HinkalUtils {
  public static convertRubicTokenToHinkalToken(
    token: Token | PriceToken | TokenAmount
  ): ERC20Token {
    return {
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      chainId: blockchainId[token.blockchain],
      erc20TokenAddress: token.address
    };
  }

  public static async updateSnapshot(hinkal: Hinkal<unknown>, chainId: number): Promise<void> {
    const hinkalSnapshot = (await get('hinkalSnapshot')) || {};
    const cachedShapshot = hinkalSnapshot[chainId];

    if (cachedShapshot) {
      const parsedMerkle = JSON.parse(cachedShapshot);

      const treeMap = this.restoreMerkle(parsedMerkle.merkleTree.tree);
      const treeMapAccessToken = this.restoreMerkle(parsedMerkle.merkleTreeAccessToken.tree);

      hinkal.merkleTreeHinkal = MerkleTree.createWithData(
        treeMap,
        undefined,
        BigInt(parsedMerkle.merkleTree.index),
        BigInt(parsedMerkle.merkleTree.count),
        poseidonFunction,
        MERKLE_LEVELS,
        0n
      );

      hinkal.merkleTreeAccessToken = MerkleTree.createWithData(
        treeMapAccessToken,
        undefined,
        BigInt(parsedMerkle.merkleTreeAccessToken.index),
        BigInt(parsedMerkle.merkleTreeAccessToken.count),
        poseidonFunction,
        MERKLE_LEVELS,
        0n
      );

      hinkal.approvals = new Map(Object.entries(parsedMerkle.approvals));
      hinkal.nullifiers = new Set(parsedMerkle.nullifiers);
    }

    await hinkal.getEventsFromHinkal();
  }

  private static restoreMerkle(tree: object): Map<bigint, bigint> {
    const treeMap = new Map();
    Object.entries(tree).forEach(([k, v]) => {
      treeMap.set(BigInt(k), BigInt(v));
    });

    return treeMap;
  }
}
