import { Asset } from '@features/swaps/shared/models/form/asset';
import { isMinimalToken } from '@shared/utils/is-token';
import { compareTokens } from '@shared/utils/utils';
import { compareFiats } from '@features/swaps/shared/utils/compare-fiats';

export function compareAssets(asset0: Asset, asset1: Asset): boolean {
  if (isMinimalToken(asset0)) {
    return isMinimalToken(asset1) ? compareTokens(asset0, asset1) : false;
  }
  return isMinimalToken(asset1) ? false : compareFiats(asset0, asset1);
}
