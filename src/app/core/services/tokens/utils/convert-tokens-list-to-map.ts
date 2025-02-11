import { TokenAddress } from '@app/features/trade/components/assets-selector/services/tokens-list-service/models/tokens-list';
import { Token } from '@app/shared/models/tokens/token';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { isTokenAmount } from '@app/shared/utils/is-token';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';

/**
 * from https://assets.rubic.exchange/assets/ethereum-pow/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png
 * @returns ethereum-pow/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png
 */
export function getTokenKeyInMap(t: Token): string {
  const splitted = t.image.split('/');
  const imgKey = splitted.slice(splitted.length - 3).join('/');
  return imgKey;
}

export function convertTokensListToMap(
  tokensWithBalances: List<TokenAmount | Token>
): Map<TokenAddress, TokenAmount> {
  const tokensWithBalancesMap = new Map<TokenAddress, TokenAmount>();
  tokensWithBalances.forEach((t: TokenAmount | Token) => {
    if (isTokenAmount(t)) {
      tokensWithBalancesMap.set(getTokenKeyInMap(t), t);
    } else {
      const tokenAmount = { amount: new BigNumber(NaN), favorite: false, ...t } as TokenAmount;
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
