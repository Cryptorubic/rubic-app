import { isMinimalToken } from '@shared/utils/is-token';
import { compareTokens } from '@shared/utils/utils';
import { Asset } from '@features/trade/models/asset';

export function compareAssets(asset0: Asset, asset1: Asset): boolean {
  if (isMinimalToken(asset0)) {
    return isMinimalToken(asset1) ? compareTokens(asset0, asset1) : false;
  }
}
