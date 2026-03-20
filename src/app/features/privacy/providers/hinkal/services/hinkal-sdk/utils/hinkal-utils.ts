import { Token } from '@app/shared/models/tokens/token';
import { blockchainId, PriceToken, TokenAmount } from '@cryptorubic/core';
import { ERC20Token, Hinkal, MERKLE_LEVELS, MerkleTree, poseidonFunction } from '@hinkal/common';
import { get } from 'idb-keyval';
import { StoredSnapshot } from '../workers/models/stored-snapshot';
import { PureTokenAmount } from '../workers/models/worker-params';
export class HinkalUtils {
  public static convertRubicTokenToHinkalToken(
    token: Token | PriceToken | TokenAmount | PureTokenAmount
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
      const parsedMerkle = JSON.parse(cachedShapshot) as StoredSnapshot;

      const treeMap = this.restoreMerkle(parsedMerkle.merkleTree.tree);
      const treeMapAccessToken = this.restoreMerkle(parsedMerkle.merkleTreeAccessToken.tree);
      const reverseTreeMap = parsedMerkle.merkleTree.reverseTree
        ? this.restoreMerkle(parsedMerkle.merkleTree.reverseTree)
        : undefined;
      const reverseTreeMapAccessToken = parsedMerkle.merkleTreeAccessToken.reverseTree
        ? this.restoreMerkle(parsedMerkle.merkleTreeAccessToken.reverseTree)
        : undefined;

      hinkal.merkleTreeHinkal = MerkleTree.createWithData(
        treeMap,
        reverseTreeMap,
        BigInt(parsedMerkle.merkleTree.index),
        BigInt(parsedMerkle.merkleTree.count),
        poseidonFunction,
        MERKLE_LEVELS,
        0n
      );

      hinkal.merkleTreeAccessToken = MerkleTree.createWithData(
        treeMapAccessToken,
        reverseTreeMapAccessToken,
        BigInt(parsedMerkle.merkleTreeAccessToken.index),
        BigInt(parsedMerkle.merkleTreeAccessToken.count),
        poseidonFunction,
        MERKLE_LEVELS,
        0n
      );

      hinkal.approvals = new Map(
        Object.entries(parsedMerkle.approvals).map(([token, approval]) => {
          const parsedApproval = approval.map(v => ({
            tokenAddress: v.tokenAddress,
            amount: BigInt(v.amount),
            inHinkalAddress: BigInt(v.inHinkalAddress)
          }));
          return [token, parsedApproval];
        })
      );
      hinkal.nullifiers = new Set(parsedMerkle.nullifiers);
      hinkal.encryptedOutputs = parsedMerkle.encryptedOutputs;
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
