import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { compareTokens } from '@app/shared/utils/utils';
import { List } from 'immutable';

export function findIdxAndTokenInList<T extends TokenAmount>(
  tokensList: List<T>,
  token: TokenAmount
): { idx: number; token: T | null } {
  for (let idx = 0; idx < tokensList.size; idx++) {
    const currToken = tokensList.get(idx);
    if (compareTokens(currToken, token)) return { idx, token: currToken };
  }

  return { idx: -1, token: null };
}
