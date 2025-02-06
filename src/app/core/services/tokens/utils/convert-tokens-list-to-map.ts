import { TokenAddress } from '@app/features/trade/components/assets-selector/services/tokens-list-service/models/tokens-list';
import { Token } from '@app/shared/models/tokens/token';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { isTokenAmount } from '@app/shared/utils/is-token';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';

export function getTokenKeyInMap(t: Token): string {
  return `${t.blockchain}_${t.symbol}_${t.name}_${t.address}_${t.rank}`;
}

export function convertTokensListToMap(
  tokensWithBalances: List<TokenAmount | Token>
): Map<TokenAddress, TokenAmount> {
  const tokensWithBalancesMap = new Map<TokenAddress, TokenAmount>();
  tokensWithBalances.forEach((t: TokenAmount | Token) => {
    if (isTokenAmount(t)) {
      tokensWithBalancesMap.set(getTokenKeyInMap(t), t);
    } else {
      const tokenAmount = { ...t, amount: new BigNumber(NaN) } as TokenAmount;
      tokensWithBalancesMap.set(getTokenKeyInMap(tokenAmount), tokenAmount);
    }
  });

  return tokensWithBalancesMap;
}

/**
 * Sets default tokens params.
 * @param tokens Tokens list.
 * @param isFavorite Is tokens list favorite.
 */
export function getTokensWithNullBalances(
  tokens: List<Token>,
  isFavorite: boolean
): List<TokenAmount> {
  return tokens.map(token => ({
    ...token,
    amount: new BigNumber(NaN),
    favorite: isFavorite
  }));
}
