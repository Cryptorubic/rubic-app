import { BlockchainName } from '@cryptorubic/core';
import { Token } from '@shared/models/tokens/token';

export class TokensSorter {
  public sortTokensRankNetworkWithCooldown(tokens: readonly Token[]): Token[] {
    const maxConsecutiveFromSameChain = 3;
    const cooldownLength = 5;

    const tokensByChain = this.groupTokensByChain(tokens);
    this.sortTokensInsideEachChain(tokensByChain);

    const cursorByChain = this.initializeCursors(tokensByChain);
    const cooldownByChain = new Map<BlockchainName, number>();

    const result: Token[] = [];

    let lastPickedChain: BlockchainName | null = null;
    let lastPickedChainRunLength = 0;

    for (let step = 0; step < tokens.length; step++) {
      this.decreaseCooldowns(cooldownByChain);

      const pick = this.pickNextToken({
        tokensByChain,
        cursorByChain,
        cooldownByChain,
        lastPickedChain,
        lastPickedChainRunLength,
        maxConsecutiveFromSameChain
      });

      if (!pick) break;

      const { chain, token } = pick;
      result.push(token);

      cursorByChain.set(chain, (cursorByChain.get(chain) ?? 0) + 1);

      if (lastPickedChain === chain) {
        lastPickedChainRunLength++;
      } else {
        lastPickedChain = chain;
        lastPickedChainRunLength = 1;
      }

      if (lastPickedChainRunLength >= maxConsecutiveFromSameChain) {
        cooldownByChain.set(chain, Math.max(cooldownByChain.get(chain) ?? 0, cooldownLength + 1));
      }
    }

    return result;
  }

  private pickNextToken(args: {
    tokensByChain: Map<BlockchainName, Token[]>;
    cursorByChain: Map<BlockchainName, number>;
    cooldownByChain: Map<BlockchainName, number>;
    lastPickedChain: BlockchainName | null;
    lastPickedChainRunLength: number;
    maxConsecutiveFromSameChain: number;
  }): { chain: BlockchainName; token: Token } | null {
    const {
      tokensByChain,
      cursorByChain,
      cooldownByChain,
      lastPickedChain,
      lastPickedChainRunLength,
      maxConsecutiveFromSameChain
    } = args;

    let bestCandidate: { chain: BlockchainName; token: Token; score: number } | null = null;

    // Pass 1: only chains that are not in cooldown and do not break run limit
    for (const [chain, tokens] of tokensByChain) {
      const cursor = cursorByChain.get(chain) ?? 0;
      if (cursor >= tokens.length) continue;

      const isInCooldown = (cooldownByChain.get(chain) ?? 0) > 0;
      const wouldBreakRun =
        chain === lastPickedChain && lastPickedChainRunLength >= maxConsecutiveFromSameChain;

      if (isInCooldown || wouldBreakRun) continue;

      const token = tokens[cursor];
      const score = this.calculateGlobalScore(token);

      if (!bestCandidate || score > bestCandidate.score) {
        bestCandidate = { chain, token, score };
      }
    }

    if (bestCandidate) {
      return { chain: bestCandidate.chain, token: bestCandidate.token };
    }

    // Pass 2: fallback — allow cooldown chains with a heavy penalty
    for (const [chain, tokens] of tokensByChain) {
      const cursor = cursorByChain.get(chain) ?? 0;
      if (cursor >= tokens.length) continue;

      const wouldBreakRun =
        chain === lastPickedChain && lastPickedChainRunLength >= maxConsecutiveFromSameChain;

      if (wouldBreakRun) continue;

      const token = tokens[cursor];
      let score = this.calculateGlobalScore(token);

      if ((cooldownByChain.get(chain) ?? 0) > 0) {
        // Large penalty so cooldown chains are chosen only if unavoidable
        score -= 1e9;
      }

      if (!bestCandidate || score > bestCandidate.score) {
        bestCandidate = { chain, token, score };
      }
    }

    if (bestCandidate) {
      return { chain: bestCandidate.chain, token: bestCandidate.token };
    }

    // Final fallback: only one chain left
    for (const [chain, tokens] of tokensByChain) {
      const cursor = cursorByChain.get(chain) ?? 0;
      if (cursor < tokens.length) {
        return { chain, token: tokens[cursor] };
      }
    }

    return null;
  }

  private calculateGlobalScore(token: Token): number {
    const rank = Number.isFinite(token.rank) ? token.rank : -1e6;
    const networkRank = Number.isFinite(token.networkRank) ? token.networkRank! : 0;

    return rank * networkRank;
  }

  private groupTokensByChain(tokens: readonly Token[]): Map<BlockchainName, Token[]> {
    const map = new Map<BlockchainName, Token[]>();

    for (const token of tokens) {
      const chain = token.blockchain;
      const existing = map.get(chain);

      if (existing) existing.push(token);
      else map.set(chain, [token]);
    }

    return map;
  }

  private sortTokensInsideEachChain(tokensByChain: Map<BlockchainName, Token[]>): void {
    for (const tokens of tokensByChain.values()) {
      tokens.sort((a, b) => this.compareTokensInsideChain(a, b));
    }
  }

  private compareTokensInsideChain(first: Token, second: Token): number {
    if (first.rank !== second.rank) {
      return second.rank - first.rank;
    }

    const firstNetworkRank = first.networkRank ?? 0;
    const secondNetworkRank = second.networkRank ?? 0;

    if (firstNetworkRank !== secondNetworkRank) {
      return secondNetworkRank - firstNetworkRank;
    }

    return 0;
  }

  private initializeCursors(
    tokensByChain: Map<BlockchainName, Token[]>
  ): Map<BlockchainName, number> {
    const cursors = new Map<BlockchainName, number>();
    for (const chain of tokensByChain.keys()) {
      cursors.set(chain, 0);
    }
    return cursors;
  }

  private decreaseCooldowns(cooldownByChain: Map<BlockchainName, number>): void {
    for (const [chain, remaining] of cooldownByChain) {
      if (remaining <= 1) cooldownByChain.delete(chain);
      else cooldownByChain.set(chain, remaining - 1);
    }
  }
}
