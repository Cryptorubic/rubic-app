import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { Token } from '@shared/models/tokens/token';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokenAmountWithPriceChange } from '../models/tokens/available-token-amount';

export function isMinimalToken(asset: unknown): asset is MinimalToken {
  return asset && typeof asset === 'object' && 'blockchain' in asset && 'address' in asset;
}

export function isBlockchainToken(asset: unknown): asset is BlockchainToken {
  return isMinimalToken(asset) && 'name' in asset && 'symbol' in asset && 'decimals' in asset;
}

export function isToken(asset: unknown): asset is Token {
  return isBlockchainToken(asset) && 'image' in asset && 'rank' in asset && 'price' in asset;
}

export function isTokenAmount(asset: unknown): asset is TokenAmount {
  return isToken(asset) && 'amount' in asset && 'favorite' in asset;
}

export function isTokenAmountWithPriceChange(asset: unknown): asset is TokenAmountWithPriceChange {
  return (
    isToken(asset) && 'priceChange24h' in asset && 'priceChange7d' in asset && 'sourceRank' in asset
  );
}
