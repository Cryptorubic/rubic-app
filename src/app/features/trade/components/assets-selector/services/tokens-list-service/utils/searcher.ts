import { AssetType } from '@app/features/trade/models/asset';
import { Token } from '@app/shared/models/tokens/token';
import { compareAddresses } from '@app/shared/utils/utils';

export function searchByQueryOnClient(token: Token, query: string, assetType: AssetType): boolean {
  return (
    (token.blockchain === assetType || assetType === 'allChains') &&
    (compareAddresses(token.address, query) ||
      token.symbol.toLowerCase().includes(query.toLowerCase()) ||
      token.name.toLowerCase().includes(query.toLowerCase()))
  );
}
